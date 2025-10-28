<template>
  <view class="form-item" @click="onReceivingCode">
    <text class="label">Product SKU:</text>
    <up-input v-model="stockInForm.skuDesc" border="none" class="input-field"
              clearable
              placeholder=" Select SKU" readonly>
      <template #suffix>
        <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
      </template>
    </up-input>
  </view>
  <u-picker v-if="ctrl.pickerShow" ref="uPicker" :cancelText="'Cancel'" :closeOnClickOverlay="true"
            :columns="ctrl.pickerOptions" :confirmText="'Confirm'"
            :defaultIndex="ctrl.pickerDefaultIndex" :immediateChange="true"
            :show="ctrl.pickerShow" :title="ctrl.pickerTitle" :visibleItemCount="7"
            keyName="label"
            @cancel="pickerConfirm" @close="pickerConfirm" @confirm="pickerConfirm"></u-picker>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

export default {
  props: {
    // doNumber: {
    //   type: String,
    //   default: ''
    // }
  },
  watch: {
    'stockInForm.doNumber': {
      immediate: true,
      deep: true,
      handler() {
      }
    },
    'stockInForm.receivingCode': {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && this.receivingList?.length > 0) {
          let receiving = this.receivingList.find(item => item.code === newVal)

          // product columns
          let columns = []
          if (receiving.products.length > 0) {
            receiving.products.forEach((product) => {
              columns.push({
                label: `${product.productName}(${product.skuCode})`,
                value: product
              })
            })
          }
          this.columns = [columns]

          // default product
          let product
          if (this.stockInForm.skuCode) {
            product = receiving.products.find(item => item.skuCode === this.stockInForm.skuCode)
          } else {
            product = receiving.products?.length > 0 ? receiving.products[0] : null
          }

          this.setStockInForm(product)
        }
      }
    }
  },
  data() {
    return {
      columns: [],
      defaultIndex: [0, 0],
      ctrl: {
        pickerTitle: '',
        pickerOptions: [],
        pickerDefaultIndex: [],
        pickerShow: false
      }
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      scannedTags: 'scannedTags',
      receivingList: 'receivingList',
      receivingProducts: 'receivingProducts',
      tidProduct: 'tidProduct'
    }),
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useStockStore, {getReceivingList: 'getReceivingListAction'}),
    onReceivingCode() {
      if (!this.stockInForm.receivingCode) {
        this.$msg('Please select receiving code first')
        return
      }
      if (this.receivingProducts.length <= 0) {
        this.$msg('No products available')
        return
      }
      this.ctrl.pickerOptions = [...this.columns]
      this.ctrl.pickerDefaultIndex = this.defaultIndex
      this.ctrl.pickerTitle = 'Product SKU code'
      this.ctrl.pickerShow = true
    },
    pickerConfirm(e) {
      console.log(e)
      if (e) {
        this.defaultIndex = e.indexs
        this.setStockInForm(e.value[0].value)
      }
      this.ctrl.pickerShow = false
    },
    setStockInForm(product) {
      if (product) {
        this.stockInForm.skuCode = product.skuCode
        this.stockInForm.skuDesc = `${product.productName}(${product.skuCode})`
        this.tidProduct = product
      } else {
        this.stockInForm.skuCode = ''
        this.stockInForm.skuDesc = ''
        this.tidProduct = null
      }
    },

    resetForm() {
      this.setStockInForm(null)
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
  