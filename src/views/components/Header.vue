<template>
  <wms-status-bar/>
  <header v-if="true" class="header">
    <up-navbar
        :safeAreaInsetTop="true"
        bgColor="#f5e1c1"
        leftIcon=""
        leftText=""
    >
      <template #left>
        <!-- Back Button (optional) -->
        <button v-if="showBack" class="icon-btn" @click="goBack">
          <image alt="back" class="icon-img" src="/static/back.png"/>
        </button>
        <template v-else></template>
      </template>
      <template #center>
        <!-- Page Title with Icon -->
        <div :class="titleClass" class="title-container">
          <h1 class="title">{{ pageTitle }}</h1>
        </div>
      </template>
      <template #right>
        <!-- Notification Bell (Navigates to Notifications Page) -->
        <button v-if="showNotification" class="icon-btn" @click="goToNotifications">
          <image alt="notification" class="icon-img" src="/static/notification.png"/>
        </button>

        <!-- Log Out Button -->
        <button v-if="showLogOut" class="icon-btn" @click="goToLogOut">
          <image alt="logout" class="icon-img" src="/static/logout.png"/>
        </button>
      </template>
    </up-navbar>
  </header>
  <header v-if="false" class="header">
    <!-- Back Button (optional) -->
    <button v-if="showBack" class="icon-btn" @click="goBack">
      <image alt="back" class="icon-img" src="/static/back.png"/>
    </button>

    <!-- Page Title with Icon -->
    <div class="title-container">
      <h1 class="title">{{ pageTitle }}</h1>
    </div>

    <!-- Notification Bell (Navigates to Notifications Page) -->
    <button v-if="showNotification" class="icon-btn" @click="goToNotifications">
      <image alt="notification" class="icon-img" src="/static/notification.png"/>
    </button>

    <!-- Log Out Button -->
    <button v-if="showLogOut" class="icon-btn" @click="goToLogOut">
      <image alt="logout" class="icon-img" src="/static/logout.png"/>
    </button>

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

<style scoped>
.header {
  background: #f5e1c1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  font-size: 10px;
  font-weight: bolder;
  color: #000;
  font-family: 'Segoe UI', Arial, sans-serif;
  border: none;
}

.title-container {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.title-left {
  justify-content: left;
  margin-left: 16px;
}

.header-icon {
  width: 15px;
  height: 15px;
  margin-right: 8px;
}

.icon-btn {
  background: none;
  width: 40px;
  /* Keep button size manageable */
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}

.icon-img {
  width: 30px;
  /* Adjust size as needed */
  height: 30px;
  object-fit: contain;
  /* Ensures the image keeps its aspect ratio */
  /* Remove unwanted borders */
  display: block;
}
</style>
