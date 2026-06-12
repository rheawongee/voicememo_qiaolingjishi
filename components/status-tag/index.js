Component({
  properties: {
    tag: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onTap() {
      console.log('status-tag 被点击了，tag 数据：', this.properties.tag);
      this.triggerEvent('tagTap', { tag: this.properties.tag });
    }
  }
});