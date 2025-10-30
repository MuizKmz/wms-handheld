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
        <input-do-order ref="doNumber" :type="0"/>
        <input-po-number ref="poNumber"/>
        <warehouse-picker ref="warehouse"/>
        <rack-picker ref="rack"/>
        <section-picker ref="section"/>
        <supplier-list-picker ref="supplierCode"/>
        <stock-purpose-picker ref="stockInPurpose"/>
        <input-received-date ref="receivedDate"/>
        <input-received-by ref="receivedBy"/>
        <input-remark ref="remarks"/>
      </view>
      
      <!-- Add Product Button -->
      <view v-if="canAddProducts" class="add-product-section">
        <up-button 
          type="primary" 
          text="Add Product" 
          icon="plus"
          @click="onAddProduct"
          size="large"
        ></up-button>
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
import RackPicker from './components/picker-rack.vue'
import SectionPicker from './components/picker-section.vue'
import ReceivingCodeInput from './components/input-receiving-code.vue'
import SupplierListPicker from './components/picker-supplier-list.vue'
import StockPurposePicker from './components/picker-stock-purpose.vue'
import InputDoOrder from './components/input-do-order.vue'
import InputPoNumber from './components/input-po-number.vue'
import InputRemark from './components/input-remarks.vue'
import InputReceivedDate from './components/input-received-date.vue'
import InputReceivedBy from './components/input-received-by.vue'
import ProductListCard from './components/card-product-list.vue'
import ReceivingCtrl from './components/ctrl-receiving.vue'

import dayjs from 'dayjs'

export default {
  name: 'Stock-in',
  components: {
    HeaderComponent,
    WarehousePicker,
    RackPicker,
    SectionPicker,
    ReceivingCodeInput,
    SupplierListPicker,
    StockPurposePicker,
    InputDoOrder,
    InputPoNumber,
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
    },
    canAddProducts() {
      // Check if all required fields are filled
      return (
        this.receivingForm.code &&
        this.receivingForm.doNumber &&
        this.receivingForm.warehouseId &&
        this.receivingForm.rackId &&
        this.receivingForm.sectionId &&
        this.receivingForm.supplierId &&
        this.receivingForm.stockPurposeName &&
        this.receivingForm.receivedBy
      )
    }
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
    async onAddProduct() {
      if (!this.receivingForm.orderId) {
        uni.showToast({
          title: 'Please scan DO/PO first to load order',
          icon: 'none'
        })
        return
      }
      
      // Navigate to product selection page
      uni.navigateTo({
        url: '/views/receiving/select-products?orderId=' + this.receivingForm.orderId
      })
    },
    
    async toReceivingList() {
      this.$router.push('/views/receiving/list')
    },
    async onSubmit() {
      if (await this.validateAll()) {
        // Prepare receiving data
        const receivingData = {
          receivingCode: this.receivingForm.code,
          doNumber: this.receivingForm.doNumber,
          poNumber: this.receivingForm.poNumber || null,
          orderId: this.receivingForm.orderId || null,
          receivingPurpose: this.receivingForm.stockPurposeCode,
          warehouseId: this.receivingForm.warehouseId,
          rackId: this.receivingForm.rackId,
          sectionId: this.receivingForm.sectionId,
          supplierId: this.receivingForm.supplierId,
          receivingDate: dayjs().format('YYYY-MM-DD'),
          receivedBy: this.receivingForm.receivedBy,
          remarks: this.receivingForm.remark || null,
          source: 'handheld',
          createdBy: 1, // Get from user auth
          receivingItems: this.receivingProducts.map(product => ({
            productId: product.id,
            quantity: product.receivingQuantity || product.orderedQuantity,
            unit: 'pcs'
          }))
        }

        try {
          uni.showLoading({ title: 'Saving...' })
          let res = await this.$api.saveReceiving(receivingData)
          uni.hideLoading()
          
          if (res.success || res.data) {
            uni.showToast({
              title: 'Receiving saved successfully',
              icon: 'success'
            })
            
            // Reset form and navigate back
            setTimeout(() => {
              this.$router.push('/views/receiving/list')
            }, 1000)
          } else {
            uni.showToast({
              title: res.message || 'Failed to save receiving',
              icon: 'none'
            })
          }
        } catch (error) {
          uni.hideLoading()
          console.error('Save receiving error:', error)
          uni.showToast({
            title: 'Failed to save receiving',
            icon: 'none'
          })
        }
      } else {
        uni.showToast({
          title: 'Please fill all required fields',
          icon: 'none'
        })
      }
    },

    async validateAll() {
      let validateReceivingCode = await this.$refs['receivingCode'].validate()
      let validateDoNumber = await this.$refs['doNumber'].validate()
      let validateSupplierCode = await this.$refs['supplierCode'].validate()
      let validateStockInPurpose = await this.$refs['stockInPurpose'].validate()
      let validateReceivingProducts = this.receivingProducts.length > 0
      
      if (!validateReceivingProducts) {
        uni.showToast({
          title: 'Please add at least one product',
          icon: 'none'
        })
      }

      return validateReceivingCode && validateDoNumber && validateSupplierCode && validateStockInPurpose && validateReceivingProducts
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

.add-product-section {
  background-color: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
</style>