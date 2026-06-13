// 模拟全局日程存储的 key
const STORAGE_KEY = 'voiceMemo_schedules';

Page({
  data: {
    // 日程唯一标识
    scheduleId: '',
    // 任务类型
    taskType: 'work',  // work, study, meet, life
    typeLabel: '工作',
    typeColor: '#3B82F6',
    // 卡片内容
    priority: true,
    title: '',
    summary: '',
    tags: ['总结', '高优先级'],
    characterImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB-6mX5RGTAw6izHBbVhZ5lkKAZunUo2qxswa3GTymZPJ3iT2KCREFL_u2jM7iLRJTOxioF0WuFHdZN-AuMX7ki3w8R5wp0BOISyJNyrxB7IVFKyFm2qp5FpwqR1y6SKnlyfy0lIVwj7NxFl3lKEK1ujsWsX-uv4cnzJjd_b-STvqNhA_xOeAzOHNO2fHkusj5q401oBnQl9Btk0JD_Zu6ezZpXOCvX_RUJ7LPeBzfrKJ3SBBWDVC6SocgutrBYSLsN-d9msCA-pU',
    // 时间
    startDate: '2026-05-08',
    startTime: '19:00',
    endDate: '2026-05-08',
    endTime: '20:30',
    isAllDay: false,
    // 步骤清单
    steps: [
      { text: '热身 10 分钟', checked: true },
      { text: '会议回顾：整理关键讨论要点', checked: true },
      { text: '输出结论与后续计划', checked: true },
      { text: '录制会议纪要并同步团队', checked: true }
    ],
    checkedSteps: []  // 用于显示完成数量
  },

  // onLoad(options) {
  //   const { id } = options;
  //   if (id) {
  //     this.setData({ scheduleId: id });
  //     this.loadScheduleData(id);
  //   } else {
  //     // 新建日程（可预设默认值）
  //     this.initNewSchedule();
  //   }
  //   this.updateCheckedCount();
  // },

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

  // 从全局存储加载日程数据
  loadScheduleData(id) {
    const schedules = wx.getStorageSync(STORAGE_KEY) || [];
    const schedule = schedules.find(s => s.id === id);
    if (schedule) {
      this.setData({
        taskType: schedule.taskType || 'work',
        title: schedule.title || '',
        summary: schedule.summary || '',
        tags: schedule.tags || [],
        priority: schedule.priority || false,
        startDate: schedule.startDate || '2026-05-08',
        startTime: schedule.startTime || '19:00',
        endDate: schedule.endDate || '2026-05-08',
        endTime: schedule.endTime || '20:30',
        isAllDay: schedule.isAllDay || false,
        steps: schedule.steps || [],
        characterImg: schedule.characterImg || this.data.characterImg
      });
      this.updateTypeStyle();
    } else {
      this.initNewSchedule();
    }
  },

  initNewSchedule() {
    // 新建时的默认数据
    const defaultSchedule = {
      id: Date.now().toString(),
      taskType: 'work',
      title: '新日程',
      summary: '点击编辑内容',
      tags: ['待办'],
      priority: false,
      startDate: this.getTodayString(),
      startTime: '09:00',
      endDate: this.getTodayString(),
      endTime: '10:00',
      isAllDay: false,
      steps: []
    };
    this.setData({ ...defaultSchedule });
    this.updateTypeStyle();
    // 自动生成 ID 并保存以便后续操作
    this.data.scheduleId = defaultSchedule.id;
  },

  getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  // 根据 taskType 更新样式标签
  updateTypeStyle() {
    const typeMap = {
      work: { label: '工作', color: '#3B82F6' },
      study: { label: '学习', color: '#8B5CF6' },
      meet: { label: '会面', color: '#F97316' },
      life: { label: '生活', color: '#10B981' }
    };
    const t = typeMap[this.data.taskType];
    this.setData({
      typeLabel: t.label,
      typeColor: t.color
    });
  },

  // 切换任务类型
  onTabChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ taskType: type });
    this.updateTypeStyle();
  },

  // 输入框绑定
  onTitleInput(e) {
    this.setData({ title: e.detail.value });
  },
  onSummaryInput(e) {
    this.setData({ summary: e.detail.value });
  },

  // 时间选择
  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
  },
  onStartTimeChange(e) {
    this.setData({ startTime: e.detail.value });
  },
  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
  },
  onEndTimeChange(e) {
    this.setData({ endTime: e.detail.value });
  },
  onAllDayChange(e) {
    this.setData({ isAllDay: e.detail.value });
  },

  // 步骤清单操作
  toggleStep(e) {
    const { index } = e.currentTarget.dataset;
    const steps = this.data.steps;
    steps[index].checked = !steps[index].checked;
    this.setData({ steps });
    this.updateCheckedCount();
  },
  updateCheckedCount() {
    const checked = this.data.steps.filter(s => s.checked).length;
    this.setData({ checkedSteps: new Array(checked) }); // 仅用于显示计数
  },
  editSteps() {
    wx.showToast({ title: '编辑步骤功能', icon: 'none' });
  },
  addStep() {
    wx.showModal({
      title: '添加步骤',
      editable: true,
      placeholderText: '输入步骤内容',
      success: (res) => {
        if (res.confirm && res.content) {
          const newStep = { text: res.content, checked: false };
          this.setData({ steps: [...this.data.steps, newStep] });
          this.updateCheckedCount();
        }
      }
    });
  },

  // 保存修改（更新存储并同步日历页面的 tag）
  saveSchedule() {
    const schedule = {
      id: this.data.scheduleId,
      taskType: this.data.taskType,
      title: this.data.title,
      summary: this.data.summary,
      tags: this.data.tags,
      priority: this.data.priority,
      startDate: this.data.startDate,
      startTime: this.data.startTime,
      endDate: this.data.endDate,
      endTime: this.data.endTime,
      isAllDay: this.data.isAllDay,
      steps: this.data.steps,
      characterImg: this.data.characterImg
    };
    // 读取现有存储
    let schedules = wx.getStorageSync(STORAGE_KEY) || [];
    const index = schedules.findIndex(s => s.id === schedule.id);
    if (index !== -1) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    wx.setStorageSync(STORAGE_KEY, schedules);
    // 同时触发全局事件，通知日历页面更新对应日期的 tag（使用 eventBus 或直接设置一个标志）
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('scheduleUpdated', { schedule });
    }
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 删除日程
  deleteSchedule() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      confirmColor: '#FF1493',
      success: (res) => {
        if (res.confirm) {
          let schedules = wx.getStorageSync(STORAGE_KEY) || [];
          schedules = schedules.filter(s => s.id !== this.data.scheduleId);
          wx.setStorageSync(STORAGE_KEY, schedules);
          // 通知日历页面移除对应 tag
          const eventChannel = this.getOpenerEventChannel();
          if (eventChannel) {
            eventChannel.emit('scheduleDeleted', { id: this.data.scheduleId });
          }
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      }
    });
  },

  // 辅助方法
  editTime() { wx.showToast({ title: '编辑时间', icon: 'none' }); },
  onBack() { wx.navigateBack(); },
  onMore() { wx.showActionSheet({ itemList: ['复制', '分享'], success() {} }); }
});