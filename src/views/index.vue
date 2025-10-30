<template>
  <!-- Header Component -->
  <view class="page-wrapper">
    <HeaderComponent :showLogOut="true" :showNotification="true" pageTitle="Main Dashboard" titleAlign="left"/>
    <view class="dashboard">
      <!-- User Info Section -->
      <view class="user-info">
        <view class="user-avatar">
          <image src="/static/images/icons/user-avatar.svg" class="avatar-icon" mode="aspectFit"/>
        </view>
        <view class="user-details">
          <text class="info-text"><text class="label">Name:</text> {{ userInfo?.realname || userInfo?.username || 'N/A' }}</text>
          <text class="info-text"><text class="label">Role:</text> {{ userInfo?.role || userInfo?.roleName || 'N/A' }}</text>
        </view>
      </view>

      <!-- Stock Management Section -->
      <view class="stock-management">
        <text class="section-title">Stock Management</text>
        <view class="module-grid">
        <view v-if="$hasPermission('handheld:search')" class="module" @click="goToSearch">
          <view class="module-icon">
            <image src="/static/images/icons/search.svg" class="icon-img" mode="aspectFit"/>
          </view>
          <text class="module-label">Search Product</text>
        </view>
        <view v-if="$hasPermission('handheld:receiving')" class="module" @click="gotToReceiving">
          <view class="module-icon">
            <image src="/static/images/icons/receiving.svg" class="icon-img" mode="aspectFit"/>
          </view>
          <text class="module-label">Receiving</text>
        </view>
        <view v-if="$hasPermission('handheld:stock-in:epc')" class="module" @click="gotToStockIn(1,1)">
          <view class="module-icon">
            <image src="/static/images/icons/stock-in.svg" class="icon-img" mode="aspectFit"/>
          </view>
          <text class="module-label">Stock In (EPC)</text>
        </view>
        <view v-if="$hasPermission('handheld:stock-in:tid')" class="module" @click="gotToStockIn(2,1)">
          <view class="module-icon">
            <image src="/static/images/icons/stock-in-filled.svg" class="icon-img" mode="aspectFit"/>
          </view>
          <text class="module-label">Stock In (TID)</text>
        </view>
        <view v-if="$hasPermission('handheld:stock-out')" class="module" @click="goToStockOut">
          <view class="module-icon">
            <image src="/static/images/icons/stock-out.svg" class="icon-img" mode="aspectFit"/>
          </view>
          <text class="module-label">Stock Out</text>
        </view>
        <view v-if="$hasPermission('handheld:stock-take')" class="module" @click="goToStockTake">
          <view class="module-icon">
            <image src="/static/images/icons/stock-take.svg" class="icon-img" mode="aspectFit"/>
          </view>
          <text class="module-label">Stock Take</text>
        </view>
        <view v-if="$hasPermission('handheld:stock-return')" class="module" @click="goToReturn()">
          <view class="module-icon">
            <image src="/static/images/icons/return.svg" class="icon-img" mode="aspectFit"/>
          </view>
          <text class="module-label">Return</text>
        </view>
      </view>
    </view>

    <FooterComponent/>
  </view>
  </view>
</template>

<script>
import {mapActions, mapState, mapWritableState} from 'pinia'
import {useUserStore} from '@/store/user'
import {useStockStore} from '@/store/stock'
import {useReceivingStore} from '@/store/receiving'
import HeaderComponent from '@/views/components/Header.vue'
import FooterComponent from '@/views/components/Footer.vue'

export default {
  name: 'index-page',
  components: {
    HeaderComponent,
    FooterComponent
  },
  computed: {
    ...mapState(useUserStore, {userInfo: 'info'}),
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      ctrl: 'ctrl',
    }),
  },
  async onShow() {
    await this.getUserInfoAction()
    console.log('=== USER INFO DEBUG ===')
    console.log('Full userInfo object:', JSON.stringify(this.userInfo, null, 2))
    console.log('Available keys:', Object.keys(this.userInfo || {}))
    console.log('realname:', this.userInfo?.realname)
    console.log('username:', this.userInfo?.username)
    console.log('id:', this.userInfo?.id)
    console.log('staffId:', this.userInfo?.staffId)
    console.log('department:', this.userInfo?.department)
    console.log('=======================')
  },
  methods: {
    ...mapActions(useReceivingStore, {
      resetReceivingFormAction: 'resetReceivingFormAction',
    }),
    ...mapActions(useUserStore, ['getUserInfoAction']),
    goToSearch() {
      uni.navigateTo({
        url: '/views/search/index'
      })
    },
    gotToReceiving() {
      this.resetReceivingFormAction()
      uni.navigateTo({
        url: '/views/receiving/index'
      })
    },
    gotToStockIn(tagFlow, inboundType) {
      this.stockInForm.tagFlow = tagFlow
      this.stockInForm.inboundType = inboundType
      this.ctrl.isLoading = true
      this.ctrl.isLoading = 'Loading...'
      uni.navigateTo({
        url: '/views/stock-in/index'
      })
    },
    goToStockOut() {
      this.ctrl.isLoading = true
      this.ctrl.isLoading = 'Loading...'
      uni.navigateTo({
        url: '/views/stock-out/index'
      })
    },
    goToStockTake() {
      this.ctrl.isLoading = true
      this.ctrl.isLoading = 'Loading...'
      uni.navigateTo({
        url: '/views/stock-take/index'
      })
    },
    goToLoan() {
      uni.navigateTo({
        url: '/views/loan/index'
      })
    },
    goToReturn() {
      this.stockInForm.tagFlow = 1
      this.stockInForm.inboundType = 3
      uni.navigateTo({
        url: '/views/stock-return/index'
      })
    },
    goBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.reLaunch({
          url: '/views/public/login'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  background-color: #f5f7fa;
}

.page-wrapper {
  background-color: #f5f7fa;
  min-height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.dashboard {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-top: 24px;
  margin-top: 60px;
  padding-bottom: 100px;
}

.user-info {
  background: #ffffff;
  padding: 20px;
  display: flex;
  align-items: center;
  border-radius: 16px;
  margin: 0 16px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.user-avatar {
  margin-right: 16px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .avatar-icon {
    width: 48px;
    height: 48px;
  }
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  .info-text {
    font-size: 14px;
    color: #333;
    
    .label {
      font-weight: 600;
      color: #4a90e2;
      margin-right: 6px;
    }
  }
}

.stock-management {
  padding: 0 16px;
}

.section-title {
  display: block;
  text-align: left;
  margin-bottom: 16px;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 700;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.module {
  background: #ffffff;
  padding: 20px 12px;
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.module:active {
  transform: scale(0.97);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.module-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f7ff;
  border-radius: 12px;
}

.icon-img {
  width: 32px;
  height: 32px;
}

.module-label {
  display: block;
  font-weight: 600;
  margin: 0;
  color: #333;
  font-size: 14px;
}
</style>