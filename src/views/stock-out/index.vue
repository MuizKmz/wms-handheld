<template>
  <!-- Header Component -->
  <view class="page-wrapper">
    <HeaderComponent :pageTitle="pageTitle" :showBack="true" :showLogOut="true" :showNotification="true"/>

    <view v-if="!ctrl.isLoading" class="page-container">
      <!-- Details Section -->
      <scroll-view class="scroll-container" scroll-y="true">
        <view class="content-wrapper">
          <view class="form-section">
            <view class="section-header">
              <text class="section-title">Stock Out Details</text>
              <view class="clear-btn" @click="onCancel">
                <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="trash-fill" shape="circle" size="mini"
                           text="" type="info"></up-button>
              </view>
            </view>
            
            <input-do-order :type="1"/>
          </view>
          
          <!-- Products Table -->
          <product-list-card/>

          <!-- Tags Table -->
          <tag-list-card/>
        </view>
      </scroll-view>

      <stock-ctrl/>
    </view>
    <up-loading-page :loading="ctrl.isLoading" :loading-text="ctrl.loadingTxt" bg-color="#f5f7fa" color="#666"
                     font-size="16"
                     icon-size="36"></up-loading-page>
  </view>
</template>

<script>
import {useInventoryStore} from '@/store/inventory'
import {useStockStore} from '@/store/stock'
import FooterComponent from '@/views/components/Footer.vue'
import HeaderComponent from '@/views/components/Header.vue'
import {mapActions, mapState, mapWritableState} from 'pinia'
import InputDoOrder from './components/input-do-order.vue'
import ProductListCard from './components/card-product-list.vue'
import TagListCard from './components/card-tag-list.vue'
import StockCtrl from './components/ctrl-stock.vue'

import StockOutImg from '@/static/stock-out.png'

export default {
  name: 'Stock-out',
  components: {
    HeaderComponent,
    FooterComponent,
    InputDoOrder,
    ProductListCard,
    TagListCard,
    StockCtrl
  },
  data() {
    return {
      // 1:EPC 2:TID
      tagFlow: '1'
    }
  },
  computed: {
    ...mapState(useInventoryStore, {
      deviceInfo: 'deviceInfo',
      inventoryInProgress: 'inventoryInProgress',
    }),
    ...mapWritableState(useInventoryStore, {deviceInventoryList: 'deviceInventoryList'}),
    ...mapWritableState(useStockStore, {
      stockOutForm: 'stockOutForm',
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      orderProducts: 'orderProducts'
    }),
    epcMode() {
      return true  // Stock-out always uses EPC mode
    },
    pageTitle() {
      return 'Stock Out'
    },
    topImg() {
      return StockOutImg
    },
  },
  watch: {},
  async onLoad() {
    // Clear stock-in form data to prevent cross-contamination
    this.cancel()
    
    setTimeout(() => {
      // #ifdef APP-PLUS
      this.initDevice()
      // #endif
      this.ctrl.isLoading = false
    }, 1500)
  },
  onUnload() {
    // #ifdef APP-PLUS
    this.stopInventory()
    // #endif
    clearInterval(this.ctrl.queryInterval)
  },
  onShow() {
    setTimeout(() => {
      uni.$emit('onShow')
    }, 500)
    // let pageWidth = uni.getSystemInfoSync().windowWidth
    // let pageHeight = uni.getSystemInfoSync().windowHeight
    // console.log(pageWidth, pageHeight)
  },
  methods: {
    ...mapActions(useInventoryStore, {
      initDevice: 'initDeviceAction',
      startInventory: 'startInventoryAction',
      stopInventory: 'stopInventoryAction',
      getDeviceInfo: 'getDeviceInfoAction',
    }),
    ...mapActions(useStockStore, {cancel: 'cancelStockOutAction'}),
    onCancel() {
      this.cancel()
      this.$msg('Stock out reset')
    },
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

.page-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-top: 24px;
  margin-top: 60px;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 150px;
  padding-bottom: 20px;
}

.content-wrapper {
  padding: 0 16px;
}

.form-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f0f2f5;

    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: -0.3px;
    }

    .clear-btn {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      background-color: #fff1f0;
      transition: all 0.2s ease;

      &:active {
        background-color: #ffccc7;
        transform: scale(0.98);
      }
    }
  }

  .form-item {
    margin-bottom: 16px;

    .label {
      font-weight: 600;
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #333;
    }

    .input-field,
    .select-field {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 14px;
      border: 1px solid #e8eaed;
      transition: all 0.2s ease;

      &:focus {
        background-color: #fff;
        border-color: #667eea;
      }

      ::v-deep .input-right-icon {
        margin-right: 4px !important;
      }
    }
  }
}
</style>