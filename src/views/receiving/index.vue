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
          <text class="section-title">Receiving Details</text>
          <view class="list-link" @click="toReceivingList">
            <text class="list-link-text">Receiving list</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>
        
        <!-- Form fields in exact order from image -->
        <receiving-code-input ref="receivingCode"/>
        <input-p-o-number ref="poNumber"/>
        <input-d-o-number ref="doNumber"/>
        <warehouse-picker ref="warehouse"/>
        <picker-location ref="locationPicker"/>
        <supplier-list-picker ref="supplierCode"/>
        <stock-purpose-picker ref="stockInPurpose"/>
        <input-received-date ref="receivedDate"/>
        <input-received-by ref="receivedBy"/>
        <input-remark ref="remarks"/>
      </view>
      
      <!-- Products Table -->
      <product-list-card v-if="receivingProducts.length > 0"/>
      </view>
    </scroll-view>

    <receiving-ctrl @onSave="onSubmit"/>
  </view>
  <up-loading-page :loading="ctrl.isLoading" :loading-text="ctrl.loadingTxt" bg-color="#f5f7fa" color="#666"
                   font-size="16"
                   icon-size="36"></up-loading-page>
  </view>
</template>

<script>
import {useReceivingStore} from '@/store/receiving'
import HeaderComponent from '@/views/components/Header.vue'
import {mapWritableState} from 'pinia'
import WarehousePicker from './components/picker-warehouse.vue'
import ReceivingCodeInput from './components/input-receiving-code.vue'
import SupplierListPicker from './components/picker-supplier-list.vue'
import StockPurposePicker from './components/picker-stock-purpose.vue'
import PickerLocation from './components/picker-location.vue'
import InputPONumber from './components/input-do-order.vue'  // Renamed: now for PO scanning
import InputDONumber from './components/input-do-number.vue'  // New: for DO manual entry
import InputRemark from './components/input-remarks.vue'
import InputReceivedDate from './components/input-received-date.vue'
import InputReceivedBy from './components/input-received-by.vue'
import ProductListCard from './components/card-product-list.vue'
import ReceivingCtrl from './components/ctrl-receiving.vue'

import dayjs from 'dayjs'
import {useStockStore} from '@/store/stock'

export default {
  name: 'Stock-in',
  components: {
    HeaderComponent,
    WarehousePicker,
  PickerLocation,
    ReceivingCodeInput,
    SupplierListPicker,
    StockPurposePicker,
    InputPONumber,
    InputDONumber,
    InputRemark,
    InputReceivedDate,
    InputReceivedBy,
    ProductListCard,
    ReceivingCtrl
  },
  data() {
    return {
      tagFlow: '1'
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm',
      receivingProducts: 'receivingProducts',
      ctrl: 'ctrl'
    }),
    pageTitle() {
      return 'New Receiving'
    }
  },
  watch: {},
  async onLoad() {
    setTimeout(() => {
      // #ifdef APP-PLUS
      this.initDevice()
      // #endif
      // Auto-generate receiving code on load
      this.receivingForm.code = this.generateReceivingCode()
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
    // stock store access for navigation
    stockStore() {
      return useStockStore()
    },
    async toReceivingList() {
      uni.navigateTo({ url: '/views/receiving/list' })
    },
    async onSubmit() {
      if (await this.validateAll()) {
        // NEW LOGIC: Prepare receiving data with REQUIRED fields
        const receivingData = {
          receivingCode: this.receivingForm.code,
          doNumber: this.receivingForm.doNumber,  // REQUIRED: From supplier's delivery note
          orderId: this.receivingForm.orderId,  // REQUIRED: PO order ID
          receivingPurpose: this.receivingForm.stockPurposeCode,
          warehouseId: this.receivingForm.warehouseId,
          locationId: this.receivingForm.locationId || null,
          supplierId: this.receivingForm.supplierId,  // REQUIRED: Must match PO
          receivingDate: dayjs().format('YYYY-MM-DD'),
          receivedBy: this.receivingForm.receivedBy,
          remarks: this.receivingForm.remark || null,
          source: 'handheld',
          createdBy: 1, // Get from user auth
          receivingItems: this.receivingProducts.map(product => ({
            productId: product.id || product.productId,
            quantity: product.receivingQuantity || product.orderedQuantity,
            expectedQuantity: product.expectedQuantity == null ? (product.orderedQuantity || null) : product.expectedQuantity,
            unit: 'pcs'
          }))
        }

        // Validate required fields before submitting
        if (!receivingData.orderId) {
          this.$msg('Please scan PO Number first')
          return
        }

        if (!receivingData.doNumber || receivingData.doNumber.trim() === '') {
          this.$msg('Please enter DO Number from supplier\'s delivery note')
          return
        }

        if (!receivingData.supplierId) {
          this.$msg('Please select a supplier')
          return
        }

        try {
          uni.showLoading({ title: 'Saving...' })
          let res = await this.$api.saveReceiving(receivingData)
          uni.hideLoading()
          
          if (res.success || res.data) {
            this.$msg('Receiving saved successfully')

            // Offer choices after save: go Home or Stock In list
            setTimeout(async () => {
              // regenerate code for next receiving
              this.receivingForm.code = this.generateReceivingCode()

              // Show action sheet (works on uni-app)
              try {
                const resAction = await new Promise((resolve) => {
                  uni.showActionSheet({
                    itemList: ['Go Home', 'Stock In List'],
                    success: (e) => resolve({tapIndex: e.tapIndex}),
                    fail: () => resolve({tapIndex: -1})
                  })
                })

                if (resAction.tapIndex === 0) {
                  // Go to home page
                  uni.navigateTo({ url: '/views/index' })
                } else if (resAction.tapIndex === 1) {
                  // Go to Stock In page (EPC mode) - set store like index.vue
                  try {
                    const stock = this.stockStore()
                    stock.stockInForm.tagFlow = 1
                    stock.stockInForm.inboundType = 1
                    stock.ctrl.isLoading = true
                    stock.ctrl.loadingTxt = 'Loading...'
                  } catch (e) {
                    console.warn('Failed to set stock store before navigation', e)
                  }
                  uni.navigateTo({ url: '/views/stock-in/index' })
                } else {
                  // default: stay on page
                }
              } catch (err) {
                // Fallback navigation -> go to Stock In page
                uni.navigateTo({ url: '/views/stock-in/index' })
              }
            }, 1000)
          } else {
            this.$msg(res.message || 'Failed to save receiving')
          }
        } catch (error) {
          uni.hideLoading()
          console.error('Save receiving error:', error)
          
          // Show detailed error message
          const errorMsg = error?.response?.data?.message || error?.message || 'Failed to save receiving'
          this.$msg(errorMsg)
        }
      } else {
        this.$msg('Please fill all required fields')
      }
    },

    async validateAll() {
      let validateReceivingCode = await this.$refs['receivingCode'].validate()
      let validatePONumber = await this.$refs['poNumber'].validate()  // PO is required
      let validateDONumber = await this.$refs['doNumber'].validate()  // DO is required
      let validateSupplierCode = await this.$refs['supplierCode'].validate()
      let validateStockInPurpose = await this.$refs['stockInPurpose'].validate()
      let validateReceivingProducts = this.receivingProducts.length > 0
      
      if (!validateReceivingProducts) {
        this.$msg('Please add at least one product from PO order')
      }

      return validateReceivingCode && validatePONumber && validateDONumber && validateSupplierCode && validateStockInPurpose && validateReceivingProducts
    },

    generateReceivingCode() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const time = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0')
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      return `RCV-${year}${month}${day}-${time}-${random}`
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

    .list-link {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 8px;
      background-color: #f0f9ff;
      transition: all 0.2s ease;

      &:active {
        background-color: #e0f2fe;
        transform: scale(0.98);
      }

      .list-link-text {
        color: #667eea;
        font-size: 14px;
        font-weight: 600;
        margin-right: 4px;
      }

      .arrow-icon {
        color: #667eea;
        font-size: 20px;
        font-weight: 600;
        line-height: 1;
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