<template>
  <view class="form-item">
    <text class="label">{{ title }}:</text>
    <up-input v-if="type === 0" v-model="stockOutForm.doNumber" border="none" class="input-field" placeholder=" Key in">
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
    <up-input v-if="type === 1" v-model="stockOutForm.orderCode" border="none" class="input-field"
              placeholder=" Key in">
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
import {mapActions, mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

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
    'stockOutForm.orderCode': {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.getOrder()
      }
    }
  },
  data() {
    return {
      code: '',
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockOutForm: 'stockOutForm',
      scannedTags: 'scannedTags',
      orderProducts: 'orderProducts'
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
    ...mapActions(useStockStore, {getOrder: 'getOrderAction'}),
    onScanCode() {
      uni.scanCode(
          {
            autoZoom: false,
            success: (res) => {
              console.log('条码类型：' + res.scanType)
              console.log('条码内容：' + res.result)
              if (this.type === 0) {
                this.stockOutForm.doNumber = res.result
              } else {
                this.stockOutForm.orderCode = res.result
              }
            }
          }
      )
    },

    resetForm() {
      this.stockOutForm.doNumber = ''
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
  