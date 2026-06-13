Page({
  data: {
    currentYear: 2026,
    currentMonth: 5,        // 5 月
    calendarDays: []        // 存储日历网格数据，每个元素包含 day, isCurrentMonth, isToday, tags
  },

  onLoad() {
    this.generateCalendarData();
    // 监听详情页返回事件
    const eventChannel = this.getOpenerEventChannel?.();
    if (eventChannel) {
      eventChannel.on('scheduleUpdated', (data) => {
        this.generateCalendarData(); // 刷新日历数据
      });
      eventChannel.on('scheduleDeleted', (data) => {
        this.generateCalendarData();
      });
    }
  },

  // 生成当前月份的日历数据
  generateCalendarData() {
    const { currentYear, currentMonth } = this.data;
    // 获取当月第一天星期几（周一为 1，周日为 7）
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    let startWeekday = firstDayOfMonth.getDay(); // 0=周日
    startWeekday = startWeekday === 0 ? 7 : startWeekday; // 转为周一~周日 1~7
    // 偏移量：日历第一格需要显示上个月的日期数量
    const offset = startWeekday - 1;

    // 获取当月总天数
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    // 获取上月总天数（用于填充前部空白）
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();

    // 获取今天的日期（用于高亮）
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    const calendar = [];
    // 生成 6 周 * 7 = 42 格
    for (let i = 0; i < 42; i++) {
      let dayNum, isCurrentMonth, isToday = false;
      let year = currentYear, month = currentMonth;

      if (i < offset) {
        // 上个月
        dayNum = prevMonthDays - (offset - i) + 1;
        isCurrentMonth = false;
        // 调整年份月份用于可能跨年的标签查询（此处简化，只标记是否当月）
        let prevMonthYear = currentYear;
        let prevMonthNum = currentMonth - 1;
        if (prevMonthNum < 1) {
          prevMonthNum = 12;
          prevMonthYear--;
        }
        year = prevMonthYear;
        month = prevMonthNum;
      } else if (i >= offset + daysInMonth) {
        // 下个月
        dayNum = i - (offset + daysInMonth) + 1;
        isCurrentMonth = false;
        let nextMonthYear = currentYear;
        let nextMonthNum = currentMonth + 1;
        if (nextMonthNum > 12) {
          nextMonthNum = 1;
          nextMonthYear++;
        }
        year = nextMonthYear;
        month = nextMonthNum;
      } else {
        // 当月
        dayNum = i - offset + 1;
        isCurrentMonth = true;
        if (year === todayYear && month === todayMonth && dayNum === todayDate) {
          isToday = true;
        }
      }

      // 调用接口（或模拟）获取该日期的 tags
      const tags = this.getTagsForDate(year, month, dayNum);

      calendar.push({
        day: dayNum,
        isCurrentMonth,
        isToday,
        tags,
        fullDate: `${year}-${month}-${dayNum}`
      });
    }

    this.setData({ calendarDays: calendar });
  },

  /**
   * 获取某一天的 tag 列表（模拟数据 + 预留后端接口）
   * 实际使用时替换为 wx.request 调用服务端 API
   */
  getTagsForDate(year, month, day) {
    // 模拟数据：仅生成 2026年5月 的部分训练记录，与 HTML 示例类似
    // 真实场景应根据 year/month/day 请求后端，返回数组
    if (year === 2026 && month === 5) {
      const mockMap = {
        1: [{ text: '跑步', type: 'orange', icon: 'directions_run', detailId: 'run_001' }],
        3: [{ text: '6858步', type: 'cyan', icon: 'directions_walk', detailId: 'step_003' },
            { text: '背部训练', type: 'cyan', icon: 'fitness_center', detailId: 'workout_003' },
            { text: '核心稳定', type: 'black', icon: 'star', detailId: 'core_003' }],
        4: [{ text: '2814步', type: 'cyan', icon: 'directions_walk', detailId: 'step_004' },
            { text: '肩部训练', type: 'cyan', icon: 'fitness_center', detailId: 'workout_004' },
            { text: '核心稳定', type: 'black', icon: 'star', detailId: 'core_004' }],
        8: [{ text: '核心训练+', type: 'cyan', icon: 'mic', detailId: 'core_008' },
            { text: '背部训练', type: 'cyan', icon: 'fitness_center', detailId: 'workout_008' }],
        9: [{ text: '5940步', type: 'cyan', icon: 'directions_walk', detailId: 'step_009' },
            { text: '三头训练', type: 'cyan', icon: 'fitness_center', detailId: 'workout_009' },
            { text: '核心稳定', type: 'black', icon: 'star', detailId: 'core_009' }],
        13: [{ text: '7246.5步', type: 'cyan', detailId: 'step_013' },
             { text: '肩部训练', type: 'cyan', detailId: 'workout_013' },
             { text: '核心稳定', type: 'cyan', detailId: 'core_013' }],
        15: [{ text: '上臂, 腿部', type: 'cyan', icon: 'phone', detailId: 'workout_015' }],
        16: [{ text: '5848步', type: 'cyan', detailId: 'step_016' },
             { text: '背部训练', type: 'cyan', detailId: 'workout_016' }],
        20: [{ text: '2854步', type: 'cyan', detailId: 'step_020' },
             { text: '肩部训练', type: 'cyan', detailId: 'workout_020' },
             { text: '有氧训练', type: 'cyan', icon: 'favorite', detailId: 'cardio_020' }],
        23: [{ text: '11467步', type: 'orange', detailId: 'step_023' },
             { text: '背部训练', type: 'orange', detailId: 'workout_023' },
             { text: '核心稳定', type: 'orange', detailId: 'core_023' }],
        24: [{ text: '6693步', type: 'orange', detailId: 'step_024' },
             { text: '核心稳定', type: 'black', detailId: 'core_024' }],
        27: [{ text: '6820步', type: 'orange', detailId: 'step_027' },
             { text: '肩部训练', type: 'orange', detailId: 'workout_027' },
             { text: '拉伸放松', type: 'orange', icon: 'face', detailId: 'stretch_027' }],
        28: [{ text: '团队会议', type: 'orange', icon: 'mic', detailId: 'meeting_028' },
             { text: '项目复盘', type: 'orange', icon: 'assignment', detailId: 'review_028' }],
        29: [{ text: '访谈准备', type: 'orange', icon: 'mic', detailId: 'interview_029' },
             { text: '资料整理', type: 'orange', icon: 'folder', detailId: 'docs_029' }],
        30: [{ text: '练习演讲', type: 'orange', icon: 'mic', detailId: 'speech_030' },
             { text: '内容创作', type: 'orange', detailId: 'content_030' }],
        31: [{ text: '自由活动', type: 'orange', icon: 'sentiment_satisfied', detailId: 'leisure_031' },
             { text: '日记记录', type: 'orange', detailId: 'diary_031' }]
      };
      return mockMap[day] || [];
    }
    // 其他月份返回空数组，但可扩展
    return [];
  },

  // 点击 status-tag 触发（由组件或页面内事件冒泡）
  onTagTap(e) {
    console.log('calendar 页面收到 tagTap 事件，参数：', e.detail);
    const { tag } = e.detail;
    // 跳转到详情页，传递 tag 信息（如 detailId）
    if (tag && tag.detailId) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${tag.detailId}&text=${tag.text}`,
        fail: (err) => {
          console.error('跳转失败', err);
          wx.showToast({ title: '页面不存在', icon: 'error' });
        }
      });
    } else {
      wx.showModal({
        title: tag.text,
        content: '详情功能开发中',
        showCancel: false
      });
    }
  },

  // 上个月
  prevMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 1) {
      currentYear--;
      currentMonth = 12;
    } else {
      currentMonth--;
    }
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendarData();
    });
  },

  // 下个月
  nextMonth() {
    let { currentYear, currentMonth } = this.data;
    if (currentMonth === 12) {
      currentYear++;
      currentMonth = 1;
    } else {
      currentMonth++;
    }
    this.setData({ currentYear, currentMonth }, () => {
      this.generateCalendarData();
    });
  },

  // 回到本月（2026年5月示例，也可动态获取实际当前月）
  backToToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    this.setData({ currentYear: year, currentMonth: month }, () => {
      this.generateCalendarData();
    });
  },

  // 头像点击预留
  onAvatarTap() {
    wx.showToast({ title: '个人资料', icon: 'none' });
  }
});