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
          
          uni.showToast({
            title: 'Order loaded successfully',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: 'Order not found',
            icon: 'none'
          })
        }
      } catch (error) {
        uni.hideLoading()
        console.error('Failed to fetch order:', error)
        uni.showToast({
          title: 'Failed to load order',
          icon: 'none'
        })
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
  margin-bottom: 12px;
  width: 100%;

  .label {
    font-weight: 600;
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #333;
  }

  .input-field {
    background-color: #f8f8f8;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 13px;
    border: 1px solid #e8e8e8;
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 13px !important;
  margin-left: 6px !important;
}

:deep(.u-form-item__body) {
  padding: 0px !important;
}

:deep(.u-form-item__body__right__message) {
  font-size: 11px !important;
  margin-left: 0px !important;
  margin-bottom: 4px !important;
}
</style>
  