Page({
  data: {
    isRecording: false,
    recentList: [
      {
        icon: 'mic',
        colorClass: 'magenta',
        title: 'Q2 Product Strategy Meeting',
        date: 'May 8, 2025',
        duration: '12:42',
        status: 'Summary ready',
      },
      {
        icon: 'graphic_eq',
        colorClass: 'cyan',
        title: 'Client Call – Acme Corp',
        date: 'May 7, 2025',
        duration: '18:06',
        status: 'Summary ready',
      },
    ],
  },

  onShow() {
    wx.hideTabBar({ animation: false });
  },

  onHide() {
    wx.showTabBar({ animation: false });
  },

  toggleRecording() {
    this.setData({
      isRecording: !this.data.isRecording,
    });
  },
});
