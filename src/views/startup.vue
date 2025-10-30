<template>
  <view class="startup-container">
    <!-- Modern Loading Screen -->
    <view class="startup-content">
      <!-- App Logo/Icon -->
      <view class="logo-container">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      </view>

      <!-- App Title -->
      <view class="app-title">InStockly</view>
      <view class="app-subtitle">Stock Management System</view>

      <!-- Modern Loading Spinner -->
      <view class="loading-container">
        <view class="spinner">
          <view class="spinner-ring"></view>
          <view class="spinner-ring"></view>
          <view class="spinner-ring"></view>
        </view>
        <text class="loading-text">Loading...</text>
      </view>

      <!-- Version Info -->
      <text class="version-text">Version {{ versionCode }}</text>
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
.startup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.startup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.logo {
  width: 80px;
  height: 80px;
}

.app-title {
  color: white;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 48px;
  letter-spacing: 0.5px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
  opacity: 0.8;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  opacity: 0.6;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  opacity: 0.4;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
}

.version-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 400;
}
</style>
