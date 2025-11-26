<template>
  <view class="form-item">
    <text class="label">{{ title }}:</text>
    <up-input v-if="type === 0" v-model="stockInForm.doNumber" border="none" class="input-field" placeholder=" Key in" @change="onDoNumberChange">
      <template #suffix>
        <up-button
            icon="scan"
            shape="square"
            size="mini"
            text="SCAN"
            type="primary"
            @click="onScanCode"
        ></up-button>
      </template>
    </up-input>
  </view>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'
import receivingApi from '@/api/receiving'

export default {
  props: {
    /**
     * type: 0: DO, 1: Order
     */
    type: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      code: '',
      searchDebounce: null,
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      scannedTags: 'scannedTags',
      receivingProducts: 'receivingProducts'
    }),
    title() {
      return this.type === 0 ? 'DO No.' : 'Order No.'
    }
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      // Auto fetch if DO number exists
      if (this.stockInForm.doNumber) {
        this.fetchReceivingByDO()
      }
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    onScanCode() {
      uni.scanCode(
          {
            autoZoom: false,
            success: (res) => {
              console.log('条码类型：' + res.scanType)
              console.log('条码内容：' + res.result)
              if (this.type === 0) {
                this.stockInForm.doNumber = res.result
                // Auto fetch receiving data after scanning
                this.fetchReceivingByDO()
              } else {
                // this.stockInForm.orderCode = res.result
              }
            }
          }
      )
    },

    onDoNumberChange() {
      // Clear previous debounce timer
      if (this.searchDebounce) {
        clearTimeout(this.searchDebounce)
      }
      
      // Only fetch if DO number has minimum length
      if (!this.stockInForm.doNumber || this.stockInForm.doNumber.length < 3) {
        return
      }
      
      // Debounce the search to prevent premature API calls while typing
      this.searchDebounce = setTimeout(() => {
        this.fetchReceivingByDO()
      }, 500) // Wait 500ms after user stops typing
    },

    async fetchReceivingByDO() {
      if (!this.stockInForm.doNumber) {
        uni.showToast({
          title: 'Please enter DO number',
          icon: 'none',
          duration: 2000
        })
        return
      }

      uni.showLoading({
        title: 'Loading...'
      })

      try {
        console.log('Fetching receiving for DO:', this.stockInForm.doNumber)
        const response = await receivingApi.getReceivingByDoNumber(this.stockInForm.doNumber)
        
        console.log('API Response:', JSON.stringify(response))
        
        // Check if response has data
        const data = response?.data || response
        
        if (data && data.id) {
          // Populate receiving code
          this.stockInForm.receivingCode = data.receivingCode || ''
          this.stockInForm.receivingId = data.id
          
          // Populate receiving purpose and map to display name
          if (data.receivingPurpose) {
            this.stockInForm.receivingPurpose = data.receivingPurpose
            // Map enum to user-friendly display name
            const purposeMap = {
              'RAW_MATERIAL': 'Raw Material',
              'FINISHED_GOODS': 'Finished Goods'
            }
            this.stockInForm.stockPurposeName = purposeMap[data.receivingPurpose] || data.receivingPurpose
            this.stockInForm.stockPurposeCode = data.receivingPurpose
          }
          
          // Populate warehouse
          this.stockInForm.warehouseCode = data.warehouse?.warehouseCode || ''
          this.stockInForm.warehouseName = data.warehouse?.name || ''
          this.stockInForm.warehouseId = data.warehouseId
          
          // Populate location (replacing rack/section)
          if (data.location) {
            this.stockInForm.locationId = data.locationId
            this.stockInForm.locationCode = data.location.locationCode || ''
            this.stockInForm.locationName = data.location.locationName || data.location.name || ''
          } else {
            // Clear location if not present
            this.stockInForm.locationId = null
            this.stockInForm.locationCode = ''
            this.stockInForm.locationName = ''
          }
          
          // Populate supplier
          if (data.supplier) {
            this.stockInForm.supplierId = data.supplierId
            this.stockInForm.supplierCode = data.supplier.supplierCode
            this.stockInForm.supplierName = data.supplier.supplierName
          }
          
          // Populate order
          if (data.order) {
            this.stockInForm.orderId = data.orderId
            this.stockInForm.orderNo = data.order.orderNo
          }
          
          // Populate receiving items/products
          if (data.receivingItems && data.receivingItems.length > 0) {
            this.receivingProducts = data.receivingItems.map(item => ({
              id: item.productId,
              productId: item.productId,
              productCode: item.product?.productCode,
              productName: item.product?.name,
              name: item.product?.name,
              skuCode: item.product?.skuCode,
              orderedQuantity: item.expectedQuantity || item.quantity || 0,
              receivingQuantity: item.quantity,
              expectedQuantity: item.expectedQuantity == null ? item.quantity : item.expectedQuantity,
              receivedQuantity: item.quantity,
              scannedQuantity: 0,
              unit: item.unit
            }))
          }
          
          uni.hideLoading()
          uni.showToast({
            title: 'Receiving loaded!',
            icon: 'success',
            duration: 2000
          })
          
          console.log('Receiving data loaded successfully')
          console.log('Warehouse:', this.stockInForm.warehouseCode)
          console.log('Location:', this.stockInForm.locationCode)
          console.log('Receiving Code:', this.stockInForm.receivingCode)
          console.log('Stock Purpose:', this.stockInForm.inboundType)
        } else {
          uni.hideLoading()
          
          // Show detailed error
          uni.showModal({
            title: 'Not Found',
            content: `No receiving found for DO: ${this.stockInForm.doNumber}\n\nPlease check:\n1. DO number is correct\n2. Receiving was created first\n3. Database connection is working`,
            showCancel: false
          })
          
          console.log('Receiving not found for DO:', this.stockInForm.doNumber)
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Error fetching receiving:', error)
        
        // Show detailed error message
        let errorMessage = 'Failed to load receiving'
        if (error.response) {
          errorMessage = error.response.data?.message || error.response.statusText || errorMessage
        } else if (error.message) {
          errorMessage = error.message
        }
        
        uni.showModal({
          title: 'Error',
          content: `Error: ${errorMessage}\n\nDO: ${this.stockInForm.doNumber}\n\nPlease check your network connection and try again.`,
          showCancel: false
        })
      }
    },

    resetForm() {
      this.stockInForm.doNumber = ''
      this.stockInForm.receivingCode = ''
      this.receivingProducts = []
    }
  }
}
</script>
<style lang="scss" scoped>
.form-item {
  margin-bottom: 16px;
  width: 100%;

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

    &:focus-within {
      background-color: #fff;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 14px !important;
  margin-left: 6px !important;
}

:deep(.u-input__content) {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
}
</style>
  