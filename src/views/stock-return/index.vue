<template>
  <view class="page-wrapper">
    <!-- Header Component -->
    <HeaderComponent :pageTitle="pageTitle" :showBack="true" :showLogOut="true" :showNotification="true"/>

    <view v-if="!ctrl.isLoading" class="page-container">
      <!-- Details Section -->
      <scroll-view class="scroll-container" scroll-y="true">
        <view class="content-wrapper">
          <view class="form-section">
            <view class="clear-btn">
              <up-button :hairline="false" :plain="true" :throttleTime="1000" icon="trash-fill" shape="circle" size="mini"
                         text="" type="info"
                         @click="onCancel"></up-button>
            </view>
            <input-return-type/>
            <input-reference-order/>
            <input-search/>
            <input-note :status="4"/>
          </view>
          <!-- Products Table -->
          <!--      <product-list-card/>-->

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
import InputSearch from './components/input-search.vue'
import InputReturnType from './components/input-return-type.vue'
import InputReferenceOrder from './components/input-reference-order.vue'
import InputNote from './components/input-note.vue'
import TagListCard from './components/card-tag-list.vue'
import StockCtrl from './components/ctrl-stock.vue'

import ReturnImg from '@/static/return.png'

export default {
  name: 'Stock-Return',
  components: {
    HeaderComponent,
    FooterComponent,
    InputSearch,
    InputReturnType,
    InputReferenceOrder,
    InputNote,
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
    ...mapActions(useStockStore, {cancel: 'cancelStockReturnAction'}),
    onCancel() {
      this.cancel()
      this.$msg('Stock return reset')
    },
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

  .clear-btn {
    position: absolute;
    top: 6px;
    right: 12px;
    z-index: 10;
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