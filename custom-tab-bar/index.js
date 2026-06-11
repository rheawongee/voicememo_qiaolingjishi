Component({
  data: {
    value: '',
    isRecording: false,
    tabMap: {
      home1: '/pages/home1/index',
      cards: '/pages/cards/index',
      calendar: '/pages/calendar/index',
      my: '/pages/my/index',
    },
  },

  lifetimes: {
    attached() {
      this.recorderManager = wx.getRecorderManager();
      this.recorderManager.onStop((res) => {
        this.setData({ isRecording: false });
        if (res.tempFilePath) {
          wx.showToast({ title: '录音已保存', icon: 'success' });
        }
      });
      this.recorderManager.onError(() => {
        this.setData({ isRecording: false });
        wx.showToast({ title: '录音失败', icon: 'error' });
      });
    },

    ready() {
      this.syncCurrentTab();
    },

    detached() {
      if (this.data.isRecording && this.recorderManager) {
        this.recorderManager.stop();
      }
    },
  },

  pageLifetimes: {
    show() {
      this.syncCurrentTab();
    },
  },

  methods: {
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

    async onRecordTap() {
      if (!this.recorderManager) return;

      if (this.data.isRecording) {
        this.recorderManager.stop();
        return;
      }

      const authed = await this.requestRecordAuth();
      if (!authed) return;

      this.recorderManager.start({
        duration: 60000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        format: 'mp3',
      });
      this.setData({ isRecording: true });
      wx.showToast({ title: '开始录音', icon: 'none' });
    },

    requestRecordAuth() {
      return new Promise((resolve) => {
        wx.getSetting({
          success: (res) => {
            if (res.authSetting['scope.record']) {
              resolve(true);
              return;
            }

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
                  },
                });
                resolve(false);
              },
            });
          },
          fail: () => resolve(false),
        });
      });
    },
  },
});
