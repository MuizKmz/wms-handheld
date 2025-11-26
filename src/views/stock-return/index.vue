<template>
  <view class="page-wrapper">
    <!-- Header Component -->
    <HeaderComponent :pageTitle="pageTitle" :showBack="true" :showLogOut="true" :showNotification="true"/>

    <view v-if="!ctrl.isLoading" class="page-container">
      <!-- Details Section -->
      <scroll-view class="scroll-container" scroll-y="true">
        <view class="content-wrapper">
          <view class="form-section">
            <view class="section-header">
              <text class="section-title">Return Details</text>
              <view class="clear-btn" @click="onCancel">
                <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="trash-fill" shape="circle" size="mini"
                           text="" type="info"></up-button>
              </view>
            </view>
            
            <input-return-type/>
            <input-reference-order/>
            <picker-product-list @product-changed="onProductChanged"/>
            <input-note :status="4"/>
          </view>

          <!-- Selected Product Card -->
          <card-product-detail/>

          <!-- Tags Table -->
          <tag-list-card/>
        </view>
      </scroll-view>

      <stock-ctrl/>
    </view>
    
    <up-loading-page :loading="ctrl.isLoading" :loading-text="ctrl.loadingTxt" bg-color="#f5e1c1" color="#666"
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
import InputReturnType from './components/input-return-type.vue'
import InputReferenceOrder from './components/input-reference-order.vue'
import InputNote from './components/input-note.vue'
import PickerProductList from './components/picker-product-list.vue'
import CardProductDetail from './components/card-product-detail.vue'
import TagListCard from './components/card-tag-list.vue'
import StockCtrl from './components/ctrl-stock.vue'

import ReturnImg from '@/static/return.png'

export default {
  name: 'Stock-Return',
  components: {
    HeaderComponent,
    FooterComponent,
    InputReturnType,
    InputReferenceOrder,
    InputNote,
    PickerProductList,
    CardProductDetail,
    TagListCard,
    StockCtrl
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(useInventoryStore, {
      deviceInfo: 'deviceInfo',
      inventoryInProgress: 'inventoryInProgress',
    }),
    ...mapWritableState(useInventoryStore, {deviceInventoryList: 'deviceInventoryList'}),
    ...mapWritableState(useStockStore, {
      ctrl: 'ctrl',
      scannedTags: 'scannedTags',
      receivingProducts: 'receivingProducts'
    }),
    pageTitle() {
      return 'Return'
    },
    topImg() {
      return ReturnImg
    },
  },
  watch: {},
  async onLoad() {
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
  },
  methods: {
    ...mapActions(useInventoryStore, {
      initDevice: 'initDeviceAction',
      startInventory: 'startInventoryAction',
      stopInventory: 'stopInventoryAction',
      getDeviceInfo: 'getDeviceInfoAction',
    }),
    ...mapActions(useStockStore, {cancel: 'cancelStockReturnAction'}),
    onCancel() {
      this.cancel()
      this.$msg('Stock return reset')
    },
    onProductChanged(product) {
      // Clear scanned tags when product changes
      this.scannedTags = []
      this.$msg(`Product changed: ${product?.product?.name || product?.name}`)
    }
  }
}
</script>

<style lang="scss" scoped>
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
  margin-top: 60px; // Push content below header
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 150px; // Space for bottom control buttons
  padding-bottom: 20px;
}

.content-wrapper {
  padding: 0 16px;
}

.form-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f0f0f0;

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .clear-btn {
      // position: relative;
    }
  }

  .form-item {
    margin-bottom: 8px;

    .label {
      font-weight: 600;
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
    }

    .input-field,
    .select-field {
      background-color: #f5f5f5;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 12px;

      ::v-deep .input-right-icon {
        margin-right: 4px !important;
      }
    }
  }

  .location-fields {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .location-item {
      width: calc(50% - 5px);

      &:last-child {
        width: 100%;
      }
    }
  }
}
</style>