<template>
  <footer class="footer">
    <p>Version {{ versionCode }} | © 2024 - {{ currentYear }} InStockly. All rights reserved.</p>
  </footer>
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
<style scoped>
.footer {
  background: #f5e1c1;
  text-align: center;
  padding: 5px;
  font-size: 12px;
  position: absolute;
  bottom: 0;
  width: 100%;
  height: auto;
}

.footer p {
  color: black;
  size: 20px;
}
</style>
  