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
import {mapWritableState, mapActions} from 'pinia'
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
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      scannedTags: 'scannedTags',
      receivingProducts: 'receivingProducts'
    }),
    title() {
      return this.type === 0 ? 'DO No1.' : 'Order No.'
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
      // Fetch receiving when user manually types DO number
      if (this.stockInForm.doNumber && this.stockInForm.doNumber.length > 3) {
        this.fetchReceivingByDO()
      }
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
          
          // Populate warehouse/rack/section
          this.stockInForm.warehouseCode = data.warehouse?.warehouseCode || ''
          this.stockInForm.warehouseName = data.warehouse?.name || ''
          this.stockInForm.warehouseId = data.warehouseId
          
          this.stockInForm.rackCode = data.rack?.rackCode || ''
          this.stockInForm.rackName = data.rack?.rackName || ''
          this.stockInForm.rackId = data.rackId
          
          this.stockInForm.sectionCode = data.section?.sectionCode || ''
          this.stockInForm.sectionName = data.section?.sectionName || ''
          this.stockInForm.sectionId = data.sectionId
          
          // Populate supplier
          if (data.supplier) {
            this.stockInForm.supplierCode = data.supplier.supplierCode
            this.stockInForm.supplierName = data.supplier.supplierName
          }
          
          // Populate receiving items/products
          if (data.receivingItems && data.receivingItems.length > 0) {
            this.receivingProducts = data.receivingItems.map(item => ({
              productId: item.productId,
              productCode: item.product?.productCode,
              productName: item.product?.name,
              skuCode: item.product?.skuCode,
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
        } else {
          uni.hideLoading()
          
          // Show detailed error
          let errorMsg = 'Receiving not found'
          if (response?.message) {
            errorMsg = response.message
          }
          
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
  margin-bottom: 4px;

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
    font-size: 13px;

    :deep(.input-right-icon) {
      .u-icon__icon {
        font-size: 12px !important;
      }

      margin-right: 4px !important;
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 12px !important;
  margin-left: 6px !important;
}
</style>
  