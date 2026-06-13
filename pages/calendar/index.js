//page/calendar/index.js
const STORAGE_KEY = 'voiceMemo_schedules';

Page({
  data: {
    currentYear: 2026,
    currentMonth: 6,
    calendarDays: []
  },

  onLoad() {
    this.initMockDataIfNeeded(); // 首次加载时初始化 mock 数据
    this.generateCalendarData();
  },

  onShow() {
    // 每次页面显示时重新加载数据（保证从详情页返回后刷新）
    this.generateCalendarData();
  },

  // 点击日期格子 -> 添加新日程
onDayTap(e) {
  const date = e.currentTarget.dataset.date; // 格式 2026-05-03
  wx.navigateTo({
    url: `/pages/detail/detail?date=${date}`
  });
},

  // 初始化 mock 数据（仅当 storage 为空时）
  initMockDataIfNeeded() {
    const schedules = wx.getStorageSync(STORAGE_KEY);
    if (!schedules || schedules.length === 0) {
      const mockSchedules = this.generateMockSchedules();
      wx.setStorageSync(STORAGE_KEY, mockSchedules);
    }
  },

  // 生成 mock 日程数据（模拟 2026年5月的那些 tag）
  generateMockSchedules() {
    // 将原来硬编码的 tags 转换为日程对象列表
    const mockData = [
      { id: 'run_001', title: '跑步', startDate: '2026-05-01', taskType: 'life', priority: false, summary: '晨跑5公里', steps: [] },
      { id: 'step_003', title: '6858步', startDate: '2026-05-03', taskType: 'life', priority: false, summary: '今日步数', steps: [] },
      { id: 'workout_003', title: '背部训练', startDate: '2026-05-03', taskType: 'life', priority: false, summary: '健身房背部训练', steps: [] },
      { id: 'core_003', title: '核心稳定', startDate: '2026-05-03', taskType: 'life', priority: true, summary: '核心强化', steps: [] },
      { id: 'step_004', title: '2814步', startDate: '2026-05-04', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_004', title: '肩部训练', startDate: '2026-05-04', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'core_004', title: '核心稳定', startDate: '2026-05-04', taskType: 'life', priority: true, summary: '', steps: [] },
      { id: 'core_008', title: '核心训练+', startDate: '2026-05-08', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_008', title: '背部训练', startDate: '2026-05-08', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'step_009', title: '5940步', startDate: '2026-05-09', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_009', title: '三头训练', startDate: '2026-05-09', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'core_009', title: '核心稳定', startDate: '2026-05-09', taskType: 'life', priority: true, summary: '', steps: [] },
      { id: 'step_013', title: '7246.5步', startDate: '2026-05-13', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_013', title: '肩部训练', startDate: '2026-05-13', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'core_013', title: '核心稳定', startDate: '2026-05-13', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_015', title: '上臂, 腿部', startDate: '2026-05-15', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'step_016', title: '5848步', startDate: '2026-05-16', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_016', title: '背部训练', startDate: '2026-05-16', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'step_020', title: '2854步', startDate: '2026-05-20', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_020', title: '肩部训练', startDate: '2026-05-20', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'cardio_020', title: '有氧训练', startDate: '2026-05-20', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'step_023', title: '11467步', startDate: '2026-05-23', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_023', title: '背部训练', startDate: '2026-05-23', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'core_023', title: '核心稳定', startDate: '2026-05-23', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'step_024', title: '6693步', startDate: '2026-05-24', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'core_024', title: '核心稳定', startDate: '2026-05-24', taskType: 'life', priority: true, summary: '', steps: [] },
      { id: 'step_027', title: '6820步', startDate: '2026-05-27', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'workout_027', title: '肩部训练', startDate: '2026-05-27', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'stretch_027', title: '拉伸放松', startDate: '2026-05-27', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'meeting_028', title: '团队会议', startDate: '2026-05-28', taskType: 'work', priority: false, summary: '', steps: [] },
      { id: 'review_028', title: '项目复盘', startDate: '2026-05-28', taskType: 'work', priority: false, summary: '', steps: [] },
      { id: 'interview_029', title: '访谈准备', startDate: '2026-05-29', taskType: 'work', priority: false, summary: '', steps: [] },
      { id: 'docs_029', title: '资料整理', startDate: '2026-05-29', taskType: 'work', priority: false, summary: '', steps: [] },
      { id: 'speech_030', title: '练习演讲', startDate: '2026-05-30', taskType: 'work', priority: false, summary: '', steps: [] },
      { id: 'content_030', title: '内容创作', startDate: '2026-05-30', taskType: 'work', priority: false, summary: '', steps: [] },
      { id: 'leisure_031', title: '自由活动', startDate: '2026-05-31', taskType: 'life', priority: false, summary: '', steps: [] },
      { id: 'diary_031', title: '日记记录', startDate: '2026-05-31', taskType: 'life', priority: false, summary: '', steps: [] }
    ];
    // 为每个日程补充完整字段（与 detail 页面结构一致）
    return mockData.map(s => ({
      ...s,
      summary: s.summary || '',
      tags: [],
      priority: s.priority || false,
      startTime: '09:00',
      endDate: s.startDate,
      endTime: '10:00',
      isAllDay: false,
      steps: [],
      characterImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB-6mX5RGTAw6izHBbVhZ5lkKAZunUo2qxswa3GTymZPJ3iT2KCREFL_u2jM7iLRJTOxioF0WuFHdZN-AuMX7ki3w8R5wp0BOISyJNyrxB7IVFKyFm2qp5FpwqR1y6SKnlyfy0lIVwj7NxFl3lKEK1ujsWsX-uv4cnzJjd_b-STvqNhA_xOeAzOHNO2fHkusj5q401oBnQl9Btk0JD_Zu6ezZpXOCvX_RUJ7LPeBzfrKJ3SBBWDVC6SocgutrBYSLsN-d9msCA-pU',
      taskType: s.taskType || 'life'
    }));
  },

  // 获取所有日程
  getAllSchedules() {
    return wx.getStorageSync(STORAGE_KEY) || [];
  },

  // 根据日期获取 tags
  getTagsForDate(year, month, day) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const schedules = this.getAllSchedules();
    const daySchedules = schedules.filter(s => s.startDate === dateStr);
    // 转换为 status-tag 需要的格式
    return daySchedules.map(s => {
      console.log('检测到数据：', s.id, s.title);
      // 根据 taskType 映射颜色
      let type = 'cyan';
      if (s.taskType === 'work') type = 'orange';
      else if (s.taskType === 'study') type = 'purple';
      else if (s.taskType === 'meet') type = 'orange';
      else if (s.taskType === 'life') type = 'cyan';
      if (s.priority) type = 'black';
      return {
        text: s.title,
        type: type,
        icon: s.taskType === 'work' ? 'work' : (s.taskType === 'study' ? 'book' : 'mic'),
        detailId: s.id
      };
    });
  },

  // 生成日历网格（异步获取 tags）
  async generateCalendarData() {
    const { currentYear, currentMonth } = this.data;
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    let startWeekday = firstDayOfMonth.getDay();
    startWeekday = startWeekday === 0 ? 7 : startWeekday;
    const offset = startWeekday - 1;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    const calendar = [];
    for (let i = 0; i < 42; i++) {
      let dayNum, isCurrentMonth, isToday = false;
      let year = currentYear, month = currentMonth;

      if (i < offset) {
        dayNum = prevMonthDays - (offset - i) + 1;
        isCurrentMonth = false;
        let prevMonthYear = currentYear;
        let prevMonthNum = currentMonth - 1;
        if (prevMonthNum < 1) {
          prevMonthNum = 12;
          prevMonthYear--;
        }
        year = prevMonthYear;
        month = prevMonthNum;
      } else if (i >= offset + daysInMonth) {
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
        dayNum = i - offset + 1;
        isCurrentMonth = true;
        if (year === todayYear && month === todayMonth && dayNum === todayDate) {
          isToday = true;
        }
      }

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

  onTagTap(e) {
    const { tag } = e.detail;
    if (tag && tag.detailId) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${tag.detailId}`
      });
    }
  },

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

  backToToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    this.setData({ currentYear: year, currentMonth: month }, () => {
      this.generateCalendarData();
    });
  },

  onAvatarTap() {
    wx.showToast({ title: '个人资料', icon: 'none' });
  }
});