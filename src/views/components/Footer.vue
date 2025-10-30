<template>
  <view class="footer">
    <text class="footer-text">Version {{ versionCode }} | © 2024 - {{ currentYear }} InStockly. All rights reserved.</text>
  </view>
</template>
<script>
export default {
  props: {},
  data() {
    return {
      versionCode: ''
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  },
  mounted() {
    this.getVersionCode()
  },
  methods: {
    getVersionCode() {
      // #ifdef APP-PLUS
      plus.runtime.getProperty(plus.runtime.appid, async (widgetInfo) => {
        // 小版本号
        // let code = '' + widgetInfo.versionCode;
        //   let widgetInfoVersionCode = uni.getStorageSync('widget-info-version-code')
        // if(widgetInfoVersionCode){
        // 	code = widgetInfoVersionCode + ''
        // }
        // let codeArr = code.split('');
        // // 版本名称
        // let versionCode = plus.runtime.version + '.';
        // codeArr.map(item => {
        // 	versionCode += String.fromCharCode(97 + parseInt(item))
        // })
        this.versionCode = plus.runtime.version
      })
      // #endif
      // console.log(this)
      // #ifndef APP-PLUS
      this.versionCode = this.$VERSION_CODE
      // #endif

      // console.log(this.$VERSION_CODE)
    },
  }
}
</script>
<style lang="scss" scoped>
.footer {
  background: #ffffff;
  text-align: center;
  padding: 16px;
  font-size: 12px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  border-top: 1px solid #e8eaed;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-text {
  color: #666;
  font-size: 12px;
  text-align: center;
  display: block;
  width: 100%;
}
</style>
  