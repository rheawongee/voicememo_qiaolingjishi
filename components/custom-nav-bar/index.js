// components/custom-nav-bar/index.js
Component({
  properties: {
    // 导航栏标题
    title: {
      type: String,
      value: 'VoiceMemo'
    },
    // 是否显示菜单按钮
    showMenu: {
      type: Boolean,
      value: true
    },
    // 是否显示头像按钮
    showAvatar: {
      type: Boolean,
      value: true
    },
    // 头像图片地址
    avatarSrc: {
      type: String,
      value: '/static/avatar1.png'
    }
  },

  data: {},

  methods: {
    // 菜单点击事件
    onMenuTap() {
      this.triggerEvent('menuTap', {});
      // 默认行为：如果没有监听则显示提示（可选）
      // 为保持与原逻辑一致，这里触发事件，由父页面决定处理方式
    },

    // 头像点击事件
    onAvatarTap() {
      this.triggerEvent('avatarTap', {});
    }
  }
});