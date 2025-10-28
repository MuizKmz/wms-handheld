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

      <!-- Input Fields -->
      <view class="input-wrapper">
        <view class="input-group">
          <image class="input-icon" src="/static/user-icon.png"/>
          <input
              v-model="loginForm.username"
              class="styled-input"
              placeholder="EMAIL / USERNAME"
          />
        </view>

        <view class="input-spacer"></view> <!-- Added space between inputs -->

        <view class="input-group">
          <image class="input-icon" src="/static/lock-icon.png"/>
          <input
              v-model="loginInfo.password"
              class="styled-input"
              placeholder="PASSWORD"
              type="password"
          />
        </view>
      </view>

      <!-- Login Button -->
      <up-button :throttleTime="1000" class="login-button" text="LOGIN" type="primary" @click="signIn"></up-button>
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
    }
  },
  computed: {
    ...mapWritableState(useUserStore, {
      loginForm: 'loginForm'
    }),
  },
  methods: {
    ...mapActions(useUserStore, {loginAction: 'loginAction'}),
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

.logo {
  width: 80px;
  height: 80px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  //gap: 20px; /* Added space between input fields */
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
  //padding-left: 5px;
  outline: none;
  text-align: left;
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
