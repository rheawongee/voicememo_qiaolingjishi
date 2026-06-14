const app = getApp();

Page({
  data: {
    recentList: []   // 初始为空，从全局加载
  },

  onLoad() {
    // 初始化全局数据（如果尚未存在）
    if (!app.globalData.recentList) {
      app.globalData.recentList = [];
    }
    this.setData({ recentList: app.globalData.recentList });
  },

  onShow() {
    // 每次显示页面时重新同步数据（确保录音后立即刷新）
    this.updateRecentList(app.globalData.recentList || []);
  },

  // 供 custom-tab-bar 调用的更新方法
  updateRecentList(list) {
    this.setData({ recentList: list });
  },

  // 播放录音（与原逻辑一致）
  onPlayAudio(e) {
    const { path, id } = e.currentTarget.dataset;
    if (!path) {
      wx.showToast({ title: '暂无音频文件', icon: 'none' });
      return;
    }
    if (this.data.currentAudioContext) {
      this.data.currentAudioContext.stop();
      this.data.currentAudioContext.destroy();
    }
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = path;
    innerAudioContext.autoplay = true;
    innerAudioContext.onPlay(() => {
      wx.showToast({ title: '播放中', icon: 'none' });
    });
    innerAudioContext.onError((err) => {
      console.error('播放错误', err);
      wx.showToast({ title: '播放失败', icon: 'error' });
    });
    innerAudioContext.onStop(() => {
      innerAudioContext.destroy();
    });
    this.setData({ currentAudioContext: innerAudioContext });
  },

  // 其他原有的快速操作、查看全部等方法保持不变...
  onQuickAction(e) { /* ... */ },
  onViewAll() { /* ... */ },
  onMenuTap() { /* ... */ },
  onAvatarTap() { /* ... */ },

  onUnload() {
    if (this.data.currentAudioContext) {
      this.data.currentAudioContext.destroy();
    }
  }
});