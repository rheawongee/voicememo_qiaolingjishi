//page/detail/detail.js
const STORAGE_KEY = 'voiceMemo_schedules';

Page({
  data: {
    scheduleId: '',
    taskType: 'work',
    title: '',
    summary: '',
    tags: [],
    priority: false,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    isAllDay: false,
    steps: [],
    characterImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB-6mX5RGTAw6izHBbVhZ5lkKAZunUo2qxswa3GTymZPJ3iT2KCREFL_u2jM7iLRJTOxioF0WuFHdZN-AuMX7ki3w8R5wp0BOISyJNyrxB7IVFKyFm2qp5FpwqR1y6SKnlyfy0lIVwj7NxFl3lKEK1ujsWsX-uv4cnzJjd_b-STvqNhA_xOeAzOHNO2fHkusj5q401oBnQl9Btk0JD_Zu6ezZpXOCvX_RUJ7LPeBzfrKJ3SBBWDVC6SocgutrBYSLsN-d9msCA-pU',
    typeLabel: '工作',
    typeColor: '#3B82F6',
    checkedSteps: []
  },

  onLoad(options) {
    const { id, date } = options;
    if (id) {
      // 编辑已有日程
      this.setData({ scheduleId: id });
      this.loadScheduleData(id);
    } else {
      // 新建日程：传入预设日期（如果没传则使用今天）
      const defaultDate = date || this.getTodayString();
      this.initNewSchedule(defaultDate);
    }
    // 如果需要监听事件通道，保留原有代码
    const eventChannel = this.getOpenerEventChannel?.();
    if (eventChannel) {
      eventChannel.on('scheduleUpdated', () => {});
      eventChannel.on('scheduleDeleted', () => {});
    }
  },

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
        startDate: schedule.startDate || '',
        startTime: schedule.startTime || '09:00',
        endDate: schedule.endDate || '',
        endTime: schedule.endTime || '10:00',
        isAllDay: schedule.isAllDay || false,
        steps: schedule.steps || [],
        characterImg: schedule.characterImg || this.data.characterImg
      });
    } else {
      this.initNewSchedule();
    }
    this.updateCheckedCount();
  },

  initNewSchedule(defaultDate) {
    const newId = Date.now().toString();
    const schedule = {
      id: newId,
      taskType: 'work',
      startDate: defaultDate,
      startTime: '09:00',
      title: '',
      summary: '',
      tags: [],
      priority: false,
      endDate: defaultDate,
      endTime: '10:00',
      isAllDay: false,
      steps: [],
      characterImg: this.data.characterImg
    };
    this.setData({
      ...schedule,
      scheduleId: newId   // 关键：同步 scheduleId
    });
    this.updateTypeStyle();
    this.updateCheckedCount();
  },

  getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  updateTypeStyle() {
    const typeMap = {
      work: { label: '工作', color: '#3B82F6' },
      study: { label: '学习', color: '#8B5CF6' },
      meet: { label: '会面', color: '#F97316' },
      life: { label: '生活', color: '#10B981' }
    };
    const t = typeMap[this.data.taskType] || typeMap.work;
    this.setData({ typeLabel: t.label, typeColor: t.color });
  },

  onTabChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ taskType: type });
    this.updateTypeStyle();
  },

  onTitleInput(e) { this.setData({ title: e.detail.value }); },
  onSummaryInput(e) { this.setData({ summary: e.detail.value }); },
  onStartDateChange(e) {
    const rawDate = e.detail.value;
    const formatted = this.formatDate(rawDate);
    this.setData({ startDate: formatted });
    // 如果结束日期为空或小于开始日期，可同步结束日期（可选）
    if (!this.data.endDate || this.data.endDate < formatted) {
      this.setData({ endDate: formatted });
    }
  },
  onStartTimeChange(e) { this.setData({ startTime: e.detail.value }); },
  onEndDateChange(e) {
    const rawDate = e.detail.value;
    const formatted = this.formatDate(rawDate);
    this.setData({ endDate: formatted });
  },
  onEndTimeChange(e) { this.setData({ endTime: e.detail.value }); },
  onAllDayChange(e) { this.setData({ isAllDay: e.detail.value }); },

  toggleStep(e) {
    const { index } = e.currentTarget.dataset;
    const steps = this.data.steps;
    steps[index].checked = !steps[index].checked;
    this.setData({ steps });
    this.updateCheckedCount();
  },
  updateCheckedCount() {
    const checked = this.data.steps.filter(s => s.checked).length;
    this.setData({ checkedSteps: new Array(checked) });
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

  saveSchedule() {
    const schedule = {
      id: this.data.scheduleId,
      taskType: this.data.taskType,
      title: this.data.title,
      summary: this.data.summary,
      tags: this.data.tags,
      priority: this.data.priority,
      startDate: this.formatDate(this.data.startDate),
      startTime: this.data.startTime,
      endDate: this.formatDate(this.data.endDate),
      endTime: this.data.endTime,
      isAllDay: this.data.isAllDay,
      steps: this.data.steps,
      characterImg: this.data.characterImg
    };
    let schedules = wx.getStorageSync(STORAGE_KEY) || [];
    const index = schedules.findIndex(s => s.id === schedule.id);
    if (index !== -1) {
      schedules[index] = schedule;
    } else {
      schedules.push(schedule);
    }
    wx.setStorageSync(STORAGE_KEY, schedules);

    // 通知上一个页面刷新
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('scheduleUpdated', { schedule });
    }
    wx.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 500);
  },

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
          const eventChannel = this.getOpenerEventChannel();
          if (eventChannel) {
            eventChannel.emit('scheduleDeleted', { id: this.data.scheduleId });
          }
          wx.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 500);
        }
      }
    });
  },

  // 将任意格式的日期字符串转为 YYYY-MM-DD
  formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
    return dateStr;
  },

  editTime() { wx.showToast({ title: '编辑时间', icon: 'none' }); },
  editSteps() { wx.showToast({ title: '编辑步骤', icon: 'none' }); },
  onBack() { wx.navigateBack(); },
  onMore() { wx.showActionSheet({ itemList: ['复制', '分享'], success() {} }); }
});