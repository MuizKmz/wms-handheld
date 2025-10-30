<template>
  <up-form ref="submitForm" :model="receivingForm" :rules="rules">
    <up-form-item
        :borderBottom="false"
        prop="doNumber"
    >
      <view class="form-item">
        <text class="label">{{ title }}:</text>
        <up-input v-if="type === 0" v-model="receivingForm.doNumber" border="none" class="input-field"
                  placeholder=" Key in DO No.">
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
    </up-form-item>
  </up-form>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  props: {
    /**
     * type: 0: DO, 1: Order
     */
    type: {
      type: Number,
      default: 0
    }
    // doNumber: {
    //   type: String,
    //   default: ''
    // }
  },
  watch: {
    // 'receivingForm.doNumber': {
    //   immediate: true,
    //   deep: true,
    //   handler(newVal) {
    //     this.getReceivingList()
    //   }
    // }
  },
  data() {
    return {
      rules: {
        doNumber: [
          {required: true, message: 'Please select DO No.', trigger: ['change', 'blur']},
        ]
      },
      code: '',
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    }),
    title() {
      return this.type === 0 ? 'DO No.' : 'Order No.'
    }
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      // this.getReceivingList()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    onScanCode() {
      uni.scanCode({
        autoZoom: false,
        success: async (res) => {
          console.log('Barcode type:', res.scanType)
          console.log('Barcode content:', res.result)
          
          const orderNo = res.result
          
          if (this.type === 0) {
            // DO Number scan
            this.receivingForm.doNumber = orderNo
            await this.fetchOrderDetails(orderNo)
          } else {
            // PO Number scan
            this.receivingForm.poNumber = orderNo
            await this.fetchOrderDetails(orderNo)
          }
        }
      })
    },
    
    async fetchOrderDetails(orderNo) {
      try {
        uni.showLoading({ title: 'Loading order...' })
        
        // Call API to get order details
        const res = await this.$api.getOrderByNo(orderNo)
        
        uni.hideLoading()
        
        if (res && res.data) {
          const order = res.data
          console.log('Order details:', order)
          
          // Populate form with order details
          this.receivingForm.orderId = order.id
          this.receivingForm.orderNo = order.orderNo
          
          // Auto-fill supplier if available
          if (order.supplierId) {
            this.receivingForm.supplierId = order.supplierId
            this.receivingForm.supplierCode = order.supplier?.supplierCode || ''
            this.receivingForm.supplierName = order.supplier?.supplierName || ''
          }
          
          this.$msg('Order loaded successfully')
        } else {
          this.$msg('Order not found')
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to fetch order:', error)
        this.$msg('Failed to load order')
      }
    },
    
    validate() {
      return new Promise((resolve) => {
        this.$refs.submitForm.validate().then(() => {
          // console.log(res)
          resolve(true)
        }).catch(() => {
          // console.log(errors)
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
  