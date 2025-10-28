<template>
  <view class="form-item" @click="onReceivingCode">
    <text class="label">Receiving Code:</text>
    <up-input v-model="stockInForm.receivingCode" border="none" class="input-field"
              clearable
              placeholder=" Select receiving code" readonly>
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
      handler(newVal) {
        this.getReceivingList()
      }
    },
    receivingList: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          // receiving columns
          let columns = []
          let receivingList = newVal
          receivingList.forEach((item) => {
            columns.push({
              label: item.code,
              value: item
            })
          })
          this.columns = [columns]

          let receiving
          if (this.stockInForm.receivingCode) {
            receiving = newVal.find(item => item.code === this.stockInForm.receivingCode)
          } else {
            receiving = newVal[0]
          }

          // initialize scanned quantity
          if (receiving.products.length > 0) {
            receiving.products.forEach((product) => {
              product.scannedQuantity = 0
            })
          }

          // Set default form data
          this.setStockInForm(receiving)
        } else {
          // No receiving code available
          this.setStockInForm()
        }
      }
    }
  },
  data() {
    return {
      columns: [],
      defaultIndex: [0, 0, 0],
      defaultOption: {
        label: 'Default',
        value: ''
      },
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
      receivingProducts: 'receivingProducts'
    }),
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      this.getReceivingList()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useStockStore, {getReceivingList: 'getReceivingListAction'}),
    onReceivingCode() {
      if (!this.stockInForm.doNumber) {
        this.$msg('Please key in DO number first')
        return
      }
      if (this.receivingList.length <= 0) {
        this.$msg('No receiving code available')
        return
      }
      this.ctrl.pickerOptions = [...this.columns]
      this.ctrl.pickerDefaultIndex = this.defaultIndex
      this.ctrl.pickerTitle = 'Receiving code'
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
    setStockInForm(receiving) {
      if (receiving) {
        this.stockInForm.receivingCode = receiving.code
        this.stockInForm.stockPurposeCode = receiving.purposeCode
        this.stockInForm.stockPurposeName = receiving.purposeName
        this.stockInForm.warehouseCode = receiving.warehouseCode
        this.stockInForm.rackCode = receiving.rackCode
        this.receivingProducts = receiving.products
      } else {
        this.stockInForm.receivingCode = ''
        this.stockInForm.stockPurposeCode = ''
        this.stockInForm.stockPurposeName = ''
        this.stockInForm.warehouseCode = ''
        this.stockInForm.rackCode = ''
        this.receivingProducts = []
      }
    },

    resetForm() {
      // this.stockInForm.receivingCode = ''
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
  