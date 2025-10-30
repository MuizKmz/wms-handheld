<template>
  <wms-status-bar bgColor="#ffffff"/>
  <header class="header">
    <up-navbar
        :safeAreaInsetTop="true"
        bgColor="#ffffff"
        leftIcon=""
        leftText=""
    >
      <template #left>
        <view v-if="showBack" class="nav-btn back-btn" @click="goBack">
          <image src="/static/images/icons/back.svg" class="header-icon" mode="aspectFit"/>
        </view>
      </template>
      <template #center>
        <view :class="titleClass" class="title-container">
          <text class="page-title">{{ pageTitle }}</text>
        </view>
      </template>
      <template #right>
        <view class="right-actions">
          <view v-if="showNotification" class="nav-btn" @click="goToNotifications">
            <image src="/static/images/icons/bell.svg" class="header-icon" mode="aspectFit"/>
          </view>
          <view v-if="showLogOut" class="nav-btn logout-btn" @click="goToLogOut">
            <image src="/static/images/icons/power.svg" class="header-icon" mode="aspectFit"/>
          </view>
        </view>
      </template>
    </up-navbar>
  </header>
</template>

<script>
import {useUserStore} from '@/store/user'
import {mapActions} from 'pinia'

export default {
  props: {
    pageTitle: String,
    showBack: Boolean,
    showNotification: Boolean,
    showLogOut: Boolean, // ✅ Add this
    icon: String,
    titleAlign: {
      type: String,
      default: 'center'
    }
  },
  computed: {
    titleClass() {
      return {
        'title-container': true,
        'title-left': this.titleAlign === 'left',
      }
    }
  },
  methods: {
    ...mapActions(useUserStore, {logout: 'logoutAction'}),
    goToNotifications() {
      uni.navigateTo({
        url: '/views/notification',
      })
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({
          url: '/views/index'
        })
      }
    },
    goToLogOut() {
      this.logout()
    },
  },
}

</script>

<style lang="scss" scoped>
.header {
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e8eaed;
}

.title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.title-left {
  justify-content: flex-start;
  margin-left: 12px;
}

.page-title {
  font-size: 17px;
  font-weight: 600;
  color: #4a90e2;
  margin: 0;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-btn:active {
  background: #f5f5f5;
}

.header-icon {
  width: 24px;
  height: 24px;
}
</style>
