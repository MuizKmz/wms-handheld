<template>
  <view class="login-container">
    <!-- App Title -->
    <view class="app-title">InStockly</view>

    <!-- Login Box -->
    <view class="login-box">
      <view class="welcome-text">Welcome to the Stock Management App</view>

      <!-- Logo -->
      <view class="logo-container">
        <image class="logo" src="/static/logo.png"></image>
      </view>

      <wms-loading-spin class="loading-wrapper"/>
      <text class="wms-self-center version-text">Version {{ versionCode }}</text>
    </view>
  </view>
</template>

<script>
import {mapState} from 'pinia'
import {useUserStore} from '@/store/user'

export default {
  name: 'startup-page',
  components: {},
  props: {},
  data() {
    return {
      versionCode: ''
    }
  },
  onLoad() {
    setTimeout(() => {
      if (this.token) {
        uni.redirectTo({
          url: '/views/index',
        })
      } else {
        uni.redirectTo({
          url: '/views/public/login',
        })
      }
    }, 2000)
  },
  onShow() {
    this.getVersionCode()
  },
  computed: {
    ...mapState(useUserStore, ['token']),
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
      console.log(this.$VERSION_CODE)
      // #ifndef APP-PLUS
      this.versionCode = this.$VERSION_CODE
      // #endif

      console.log(this.$VERSION_CODE)
    },
  },
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  padding: 20px;
}

.app-title {
  background-color: black;
  color: white;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.login-box {
  background-color: #1a1a1a;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  width: 90%;
  max-width: 350px;
}

.welcome-text {
  color: white;
  font-size: 16px;
  margin-bottom: 20px;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.loading-wrapper {
  transform: scale(0.3);
}

.version-text {
  color: white;
}

.logo {
  width: 80px;
  height: 80px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Added space between input fields */
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 12px 14px;
}

.input-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.styled-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  padding-left: 5px;
  outline: none;
}

.input-spacer {
  height: 15px; /* Adds space between username and password */
}

.login-button {
  width: 100%;
  background-color: #f5f5f5 !important;
  color: black !important;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
}
</style>
