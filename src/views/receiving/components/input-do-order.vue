<template>
  <up-form ref="submitForm" :model="receivingForm" :rules="rules">
    <up-form-item
        :borderBottom="false"
        prop="orderNo"
    >
      <view class="form-item">
        <text class="label">PO Number:</text>
        <up-input v-model="receivingForm.orderNo" border="none" class="input-field"
                  placeholder="Scan or key in PO Number">
          <template #suffix>
            <up-button
                icon="scan"
                shape="square"
                size="mini"
                text="SCAN"
                type="primary"
                @click="onScanPO"
            ></up-button>
          </template>
        </up-input>
      </view>
    </up-form-item>
  </up-form>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  watch: {
    'receivingForm.orderNo': {
      immediate: false,
      handler(newVal) {
        if (newVal && newVal.length > 5) {
          // Auto-fetch order when PO number is typed
          this.fetchPOOrder(newVal)
        }
      }
    }
  },
  data() {
    return {
      rules: {
        orderNo: [
          {required: true, message: 'Please scan or enter PO Number', trigger: ['change', 'blur']},
        ]
      }
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    })
  },
  mounted() {
    console.log('PO Number component mounted')
  },
  methods: {
    onScanPO() {
      uni.scanCode({
        autoZoom: false,
        success: async (res) => {
          console.log('PO Barcode:', res.result)
          
          const poNumber = res.result
          this.receivingForm.orderNo = poNumber
          
          // Fetch PO order details
          await this.fetchPOOrder(poNumber)
        }
      })
    },
    
    async fetchPOOrder(poNumber) {
      try {
        uni.showLoading({ title: 'Loading PO order...' })
        
        // Call API to get order details by order number
        const res = await this.$api.getOrderByNo(poNumber)
        
        uni.hideLoading()
        
        if (res && res.data) {
          const order = res.data
          console.log('PO Order details:', order)
          
          // Validate that it's a PO order
          if (order.orderType !== 'PO') {
            uni.showModal({
              title: 'Invalid Order Type',
              content: `Order ${order.orderNo} is type ${order.orderType}.\n\nReceiving can only be created for PO (Purchase Order) orders.\n\nFor SO orders, use the Shipment process.`,
              showCancel: false
            })
            this.receivingForm.orderNo = ''
            this.receivingForm.orderId = null
            return
          }

          // Validate that PO has a supplier assigned
          if (!order.supplierId) {
            uni.showModal({
              title: 'Missing Supplier',
              content: `PO order ${order.orderNo} does not have a supplier assigned.\n\nPlease update the PO order in the admin system to assign a supplier before receiving.`,
              showCancel: false
            })
            this.receivingForm.orderNo = ''
            this.receivingForm.orderId = null
            return
          }
          
          // Populate form with PO order details
          this.receivingForm.orderId = order.id
          this.receivingForm.orderNo = order.orderNo
          
          // Auto-fill supplier (REQUIRED for PO)
          this.receivingForm.supplierId = order.supplierId
          this.receivingForm.supplierCode = order.supplier?.supplierCode || ''
          this.receivingForm.supplierName = order.supplier?.supplierName || ''
          
          // Don't auto-load products - user must click Add Product button
          // Just store the order info for later product selection
          
          this.$msg('PO order loaded successfully. Click Add Product to select items.')
          
          // Emit event to notify other components
          uni.$emit('poOrderLoaded', order)
        } else {
          this.$msg('PO order not found')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to fetch PO order:', error)
        this.$msg('Failed to load PO order')
      }
    },
    
    validate() {
      return new Promise((resolve) => {
        this.$refs.submitForm.validate().then(() => {
          resolve(true)
        }).catch(() => {
          resolve(false)
        })
      })
    },
    resetForm() {
      this.receivingForm.doNumber = ''
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

  .input-field {
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

:deep(.u-form-item__body) {
  padding: 0px !important;
}

:deep(.u-form-item__body__right__message) {
  font-size: 12px !important;
  margin-left: 0px !important;
  margin-bottom: 6px !important;
  color: #ff4d4f;
  font-weight: 500;
}
</style>
  