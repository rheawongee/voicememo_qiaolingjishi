const app = getApp();

Component({
  data: {
    isRecording: false,      // 是否正在录音
    recorderManager: null,
     tabMap: {
      home1: '/pages/home1/index',
      diary: '/pages/diary/index',
      calendar: '/pages/calendar/index',
      my: '/pages/my/index',
    },
  },

  lifetimes: {
    attached() {
      // 初始化录音管理器
      const recorderManager = wx.getRecorderManager();
      this.recorderManager = recorderManager;

      // 监听录音结束
      recorderManager.onStop((res) => {
        const { tempFilePath, duration } = res;
        if (tempFilePath) {
          this.saveNewRecord(tempFilePath, duration);
        }
        this.setData({ isRecording: false });
      });

      recorderManager.onError((err) => {
        console.error('录音错误', err);
        const wasRecording = this.data.isRecording;
        this.setData({ isRecording: false });
        // 没在录音的时候不弹出
        if (!wasRecording) return;
        wx.showToast({
          title: '录音失败',
          icon: 'error'
        });
      });
    },

    detached() {
      // 组件销毁时停止录音并释放资源
      if (this.recorderManager && this.data.isRecording) {
        this.recorderManager.stop();
      }
    },
  },

  methods: {
    // 生成新录音记录并保存到全局
    saveNewRecord(filePath, duration) {
      const now = new Date();
      const newRecord = {
        id: Date.now().toString(),
        title: `新录音 ${now.toLocaleTimeString()}`,
        date: `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`,
        time: `${now.getHours()}:${now.getMinutes()}`,
        summaryStatus: false,
        audioPath: filePath,
        iconColor: 'bg-pink',
      };

      // 1. 更新全局数据
      if (!app.globalData.recentList) {
        app.globalData.recentList = [];
      }
      app.globalData.recentList = [newRecord, ...app.globalData.recentList];

      // 2. 通知当前页面刷新（调用页面的刷新方法）
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && typeof currentPage.updateRecentList === 'function') {
        currentPage.updateRecentList(app.globalData.recentList);
      } else {
        // 兜底：触发一个全局事件，页面 onShow 时自己拉取
        wx.showToast({ title: '录音已保存', icon: 'success' });
      }
    },

    // 请求录音权限
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

    // 录音按钮点击（绑定到UI上的录音按钮）
    async onRecordTap() {
      if (this.data.isRecording) {
        this.recorderManager.stop();
      } else {
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

    syncCurrentTab() {
      const pages = getCurrentPages();
      const curPage = pages[pages.length - 1];
      if (!curPage) return;

      const nameRe = /pages\/(\w+)\/index/.exec(curPage.route);
      if (!nameRe) return;

      this.setData({ value: nameRe[1] });
    },

    onNavTap(e) {
      const { value } = e.currentTarget.dataset;
      if (value === this.data.value) return;

      const url = this.data.tabMap[value];
      if (!url) return;

      wx.switchTab({
        url,
        fail() {
          wx.showToast({ title: '页面开发中', icon: 'none' });
        },
      });
    },
  },
});