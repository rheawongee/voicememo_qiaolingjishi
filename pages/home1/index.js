// pages/home1/index.js
Page({
  data: {
    // 最近录音列表
    recentList: [
      {
        id: '1',
        title: 'Q2 Product Strategy Meeting',
        date: 'May 8, 2025',
        time: '12:42',
        summaryStatus: true,
        audioPath: '', // 演示数据无实际音频
        iconColor: 'bg-pink'
      },
      {
        id: '2',
        title: 'Client Call – Acme Corp',
        date: 'May 7, 2025',
        time: '18:06',
        summaryStatus: true,
        audioPath: '',
        iconColor: 'bg-cyan'
      }
    ],
    isRecording: false,
    recorderManager: null,
    currentAudioContext: null,
    tempAudioPath: '' // 最新录音文件路径
  },

  onLoad() {
    // 初始化录音管理器
    const recorderManager = wx.getRecorderManager();
    this.recorderManager = recorderManager;
    
    // 监听录音结束
    recorderManager.onStop((res) => {
      const { tempFilePath, duration } = res;
      if (tempFilePath) {
        // 生成新记录
        const now = new Date();
        const newRecord = {
          id: Date.now().toString(),
          title: `新录音 ${now.toLocaleTimeString()}`,
          date: `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`,
          time: `${now.getHours()}:${now.getMinutes()}`,
          summaryStatus: false,
          audioPath: tempFilePath,
          iconColor: 'bg-pink'
        };
        this.setData({
          recentList: [newRecord, ...this.data.recentList],
          isRecording: false,
          tempAudioPath: tempFilePath
        });
        wx.showToast({ title: '录音已保存', icon: 'success' });
      } else {
        this.setData({ isRecording: false });
      }
    });

    recorderManager.onError((err) => {
      console.error('录音错误', err);
      this.setData({ isRecording: false });
      wx.showToast({ title: '录音失败', icon: 'error' });
    });
  },

  onUnload() {
    if (this.data.currentAudioContext) {
      this.data.currentAudioContext.destroy();
    }
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
  },

  // 菜单点击
  onMenuTap() {
    wx.showToast({ title: '菜单功能开发中', icon: 'none' });
  },

  // 头像点击
  onAvatarTap() {
    wx.showToast({ title: '个人中心', icon: 'none' });
  },

  // 录音按钮点击
  async onRecordTap() {
    if (this.data.isRecording) {
      // 停止录音
      this.recorderManager.stop();
    } else {
      // 开始录音前请求权限
      const authStatus = await this.requestRecordAuth();
      if (!authStatus) return;
      this.recorderManager.start({
        duration: 60000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        format: 'mp3'
      });
      this.setData({ isRecording: true });
      wx.showToast({ title: '开始录音', icon: 'none' });
    }
  },

  requestRecordAuth() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.record']) {
            resolve(true);
          } else {
            wx.authorize({
              scope: 'scope.record',
              success: () => resolve(true),
              fail: () => {
                wx.showModal({
                  title: '提示',
                  content: '需要麦克风权限才能录音',
                  confirmText: '去设置',
                  success: (modalRes) => {
                    if (modalRes.confirm) wx.openSetting();
                  }
                });
                resolve(false);
              }
            });
          }
        }
      });
    });
  },

  // 播放录音
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

  // 快速操作按钮点击
  onQuickAction(e) {
    const { type } = e.currentTarget.dataset;
    wx.showModal({
      title: '智能助手',
      content: `即将执行「${type}」功能，正式版会接入AI服务`,
      showCancel: false
    });
  },

  // 底部导航切换（演示）
  onNavTap(e) {
    const { page } = e.currentTarget.dataset;
    wx.showToast({ title: `切换到${page}`, icon: 'none' });
  },

  // 查看更多
  onViewAll() {
    wx.showToast({ title: '查看全部记录', icon: 'none' });
  }
});