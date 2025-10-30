<template>
  <view class="login-container">
    <!-- Header Section -->
    <view class="login-header">
      <view class="brand-section">
        <view class="logo-container">
          <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        </view>
        <view class="brand-text">
          <text class="app-title">InStockly</text>
          <text class="app-subtitle">Warehouse Management System</text>
        </view>
      </view>
    </view>

    <!-- Login Card -->
    <view class="login-card">
      <view class="card-header">
        <text class="welcome-title">Welcome Back</text>
        <text class="welcome-subtitle">Sign in to continue</text>
      </view>

      <!-- Input Fields -->
      <view class="form-section">
        <view class="form-group">
          <text class="input-label">Username or Email</text>
          <view class="input-container">
            <image src="/static/images/icons/user.svg" class="input-icon-img" mode="aspectFit"/>
            <input
              v-model="loginForm.username"
              class="form-input"
              placeholder="Enter your username"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="form-group">
          <text class="input-label">Password</text>
          <view class="input-container">
            <image src="/static/images/icons/lock.svg" class="input-icon-img" mode="aspectFit"/>
            <input
              v-model="loginInfo.password"
              class="form-input"
              placeholder="Enter your password"
              placeholder-class="input-placeholder"
              :type="showPassword ? 'text' : 'password'"
            />
            <view class="eye-icon" @click="togglePassword">
              <image 
                :src="showPassword ? '/static/images/icons/eye-open.svg' : '/static/images/icons/eye-closed.svg'" 
                class="eye-icon-img" 
                mode="aspectFit"
              />
            </view>
          </view>
        </view>

        <!-- Login Button -->
        <up-button 
          :throttleTime="1000" 
          class="login-button" 
          text="Sign In" 
          type="primary" 
          @click="signIn"
          size="large"
        ></up-button>
      </view>
    </view>

    <!-- Footer -->
    <view class="login-footer">
      <text class="footer-text">© 2025 InStockly. All rights reserved.</text>
    </view>
  </view>
</template>

<script>
import {mapActions, mapWritableState} from 'pinia'
import {useUserStore} from '@/store/user'

export default {
  name: 'login-page',
  data() {
    return {
      loginInfo: {
        password: '',
      },
      showPassword: false
    }
  },
  computed: {
    ...mapWritableState(useUserStore, {
      loginForm: 'loginForm'
    }),
  },
  methods: {
    ...mapActions(useUserStore, {loginAction: 'loginAction'}),
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    signIn() {
      if (!this.loginForm.username) {
        uni.showToast({
          title: 'Please enter your username',
          icon: 'none'
        })
        return
      }
      if (!this.loginInfo.password) {
        uni.showToast({
          title: 'Please enter your password',
          icon: 'none'
        })
        return
      }
      this.loginAction({
        username: this.loginForm.username,
        password: this.loginInfo.password
      }).then((res) => {
        uni.hideLoading()
        if (res.success) {
          // uni.setStorageSync('TOKEN',res.data.accessToken)
          uni.showLoading({
            title: 'Success',
            complete: () => {
              uni.hideLoading()
              uni.redirectTo({
                url: '/views/index'
              })
            }
          })
        } else {
          uni.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      }).catch(() => {
        uni.hideLoading()
      })
      // uni.navigateTo({
      //   url: '/views/index',
      // })
    },
  },
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.login-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px 30px;
  color: white;
}

.brand-section {
  text-align: center;
}

.logo-container {
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.logo {
  width: 60px;
  height: 60px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.app-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.app-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  line-height: 1.3;
}

.login-card {
  background: #ffffff;
  border-radius: 32px 32px 0 0;
  padding: 32px 24px 40px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.card-header {
  margin-bottom: 32px;
}

.welcome-title {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.welcome-subtitle {
  display: block;
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-left: 4px;
}

.input-container {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 14px 16px;
  border: 2px solid #e8eaed;
  transition: all 0.3s ease;
  position: relative;

  &:focus-within {
    background: #ffffff;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
}

.input-icon-img {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  opacity: 0.7;
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
  color: #333;
}

.eye-icon {
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-icon-img {
  width: 20px;
  height: 20px;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:active {
    opacity: 1;
  }
}

.input-placeholder {
  color: #999;
  font-size: 14px;
}

.login-button {
  margin-top: 12px;
  border-radius: 12px !important;
  height: 52px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  
  :deep(.u-button__text) {
    font-weight: 600;
  }
}

.login-footer {
  padding: 20px;
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}
</style>
