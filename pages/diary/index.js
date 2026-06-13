// pages/diary/index.js
const STORAGE_KEY = 'voiceMemo_schedules';
const SWIPE_THRESHOLD = 45;
const ANIMATION_LOCK_TIME = 430;

const TYPE_META = {
  work: {
    label: '工作',
    icon: 'internet',
    color: '#F82B8F'
  },
  study: {
    label: '学习',
    icon: 'book-open',
    color: '#7C5CFF'
  },
  meet: {
    label: '会面',
    icon: 'usergroup',
    color: '#FF8A00'
  },
  life: {
    label: '生活',
    icon: 'home',
    color: '#00A7A7'
  }
};

Page({
  data: {
    cards: [],           // 当天卡片数据
    displayCards: [],    // 用于堆叠显示的卡片，包含位置、旋转、层级等动态属性
    currentIndex: 0,
    todayText: '',
    startX: 0,
    startY: 0,
    isSwiping: false,
    isAnimating: false
  },

  onLoad() {
    this.loadDataFromStorage();
  },

  onShow() {
    // 每次显示时刷新数据，用于从详情页返回后同步更新
    this.loadDataFromStorage();
  },

  loadDataFromStorage() {
    const schedules = wx.getStorageSync(STORAGE_KEY) || [];
    const today = this.getTodayDateKey();

    // 当前页面只展示“当天日期”的日程卡片；跨天日程只要包含今天也会显示
    const cards = schedules
      .filter(s => this.isScheduleOnDate(s, today))
      .map(s => this.normalizeScheduleToCard(s))
      .sort((a, b) => {
        if (a.startTime === b.startTime) return String(a.id).localeCompare(String(b.id));
        return a.startTime > b.startTime ? 1 : -1;
      });

    this.setData({
      cards,
      currentIndex: 0,
      todayText: this.formatDisplayDate(today)
    });
    this.buildDisplayCards();
  },

  normalizeScheduleToCard(schedule) {
    const taskType = schedule.taskType || schedule.type || 'work';
    const meta = TYPE_META[taskType] || TYPE_META.work;
    const startDate = this.normalizeDateKey(schedule.startDate) || this.getTodayDateKey();
    const endDate = this.normalizeDateKey(schedule.endDate) || startDate;

    return {
      id: schedule.id,
      title: schedule.title || '未命名日程',
      summary: schedule.summary || '',
      taskType,
      typeLabel: meta.label,
      typeIcon: meta.icon,
      typeColor: meta.color,
      startDate,
      endDate,
      displayDate: this.formatDisplayDate(startDate),
      startTime: schedule.startTime || '09:00',
      endTime: schedule.endTime || '10:00',
      isCompleted: Boolean(schedule.isCompleted),
      note: typeof schedule.note === 'string' ? schedule.note : (schedule.summary || ''),
      isEditing: false
    };
  },

  getTodayDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  normalizeDateKey(value) {
    if (!value) return '';

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const raw = String(value).trim();
    if (!raw) return '';

    // 兼容 2026-05-10 / 2026/05/10 / 2026.05.10 / 2026年05月10日
    const matched = raw.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
    if (matched) {
      const [, year, month, day] = matched;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const timestamp = Number(raw);
    if (!Number.isNaN(timestamp) && raw.length >= 10) {
      return this.normalizeDateKey(new Date(timestamp));
    }

    return '';
  },

  isScheduleOnDate(schedule, targetDate) {
    const startDate = this.normalizeDateKey(schedule.startDate);
    const endDate = this.normalizeDateKey(schedule.endDate) || startDate;

    if (!startDate) return false;
    return startDate <= targetDate && targetDate <= endDate;
  },

  formatDisplayDate(dateKey) {
    if (!dateKey) return '';
    const [, month, day] = dateKey.split('-');
    return `Today · ${month}.${day}`;
  },

  getStackStyle(order, total) {
    const visibleStyles = [
      { x: 0,  y: 0,  scale: 1,    rotate: 0, opacity: 1, zIndex: 40 },
      { x: 36, y: 24, scale: 0.97, rotate: 3, opacity: 1, zIndex: 30 },
      { x: 72, y: 48, scale: 0.94, rotate: 6, opacity: 1, zIndex: 20 }
    ];

    const style = visibleStyles[order] || {
      x: 96,
      y: 64,
      scale: 0.9,
      rotate: 8,
      opacity: 0,
      zIndex: 0
    };

    // 总数小于 3 时，避免露出不存在的空层；总数大于 3 时只显示前三层，其余隐藏等待切换
    const zIndex = total - order > 0 ? style.zIndex : 0;

    return {
      ...style,
      zIndex,
      cardStyle: `z-index: ${zIndex}; opacity: ${style.opacity}; transform: translate3d(${style.x}rpx, ${style.y}rpx, 0) scale(${style.scale}) rotate(${style.rotate}deg);`
    };
  },

  buildDisplayCards() {
    const { cards, currentIndex } = this.data;
    const total = cards.length;

    if (total === 0) {
      this.setData({ displayCards: [] });
      return;
    }

    const displayCards = cards.map((card, index) => {
      const order = (index - currentIndex + total) % total;
      const stackStyle = this.getStackStyle(order, total);

      return {
        ...card,
        order,
        isActive: order === 0,
        ...stackStyle
      };
    });

    this.setData({ displayCards });
  },

  goNextCard() {
    const { cards, currentIndex, isAnimating } = this.data;
    if (isAnimating || cards.length <= 1) return;

    this.setData({
      currentIndex: (currentIndex + 1) % cards.length,
      isAnimating: true
    });
    this.buildDisplayCards();

    setTimeout(() => {
      this.setData({ isAnimating: false });
    }, ANIMATION_LOCK_TIME);
  },

  goPrevCard() {
    const { cards, currentIndex, isAnimating } = this.data;
    if (isAnimating || cards.length <= 1) return;

    this.setData({
      currentIndex: (currentIndex - 1 + cards.length) % cards.length,
      isAnimating: true
    });
    this.buildDisplayCards();

    setTimeout(() => {
      this.setData({ isAnimating: false });
    }, ANIMATION_LOCK_TIME);
  },

  onTouchStart(e) {
    if (this.data.cards.length <= 1) return;

    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      isSwiping: true
    });
  },

  onTouchMove(e) {
    if (!this.data.isSwiping) return;

    const deltaX = e.touches[0].clientX - this.data.startX;
    const deltaY = e.touches[0].clientY - this.data.startY;

    // 横向移动明显大于纵向移动时，认为用户正在切换卡片
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 12) {
      return false;
    }
  },

  onTouchEnd(e) {
    if (!this.data.isSwiping) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - this.data.startX;
    const deltaY = endY - this.data.startY;

    this.setData({ isSwiping: false });

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0) {
      this.goNextCard();
    } else {
      this.goPrevCard();
    }
  },

  toggleStatus(e) {
    const { id } = e.currentTarget.dataset;
    const cards = [...this.data.cards];
    const index = cards.findIndex(c => String(c.id) === String(id));

    if (index === -1) return;

    cards[index].isCompleted = !cards[index].isCompleted;
    this.setData({ cards });
    this.syncToStorage(cards[index]);
    this.buildDisplayCards();
  },

  syncToStorage(card) {
    const schedules = wx.getStorageSync(STORAGE_KEY) || [];
    const target = schedules.find(s => String(s.id) === String(card.id));

    if (target) {
      target.isCompleted = card.isCompleted;
      target.note = card.note;
      wx.setStorageSync(STORAGE_KEY, schedules);
    }
  },

  toggleEdit(e) {
    const { id } = e.currentTarget.dataset;
    const cards = [...this.data.cards];
    const index = cards.findIndex(c => String(c.id) === String(id));

    if (index === -1) return;

    const currentEditing = cards[index].isEditing;
    if (currentEditing) {
      this.syncToStorage(cards[index]);
    }

    cards[index].isEditing = !currentEditing;
    this.setData({ cards });
    this.buildDisplayCards();
  },

  onNoteInput(e) {
    const { id } = e.currentTarget.dataset;
    const value = e.detail.value;
    const cards = [...this.data.cards];
    const index = cards.findIndex(c => String(c.id) === String(id));

    if (index === -1) return;

    cards[index].note = value;
    this.setData({ cards });
    this.buildDisplayCards();
  },

  onMenu() {
    wx.showToast({ title: '菜单功能', icon: 'none' });
  },

  onAvatar() {
    wx.showToast({ title: '个人中心', icon: 'none' });
  }
});
