<template>
  <u-picker v-if="ctrl.productPickerShow" ref="uPicker" :cancelText="'Cancel'" :closeOnClickOverlay="true"
            :columns="columns" :confirmText="'Confirm'"
            :defaultIndex="pickerDefaultIndex" :immediateChange="true"
            :show="ctrl.productPickerShow" :title="pickerTitle" :visibleItemCount="7"
            keyName="label"
            @cancel="pickerConfirm" @close="pickerConfirm" @confirm="pickerConfirm"></u-picker>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  props: {},
  watch: {
    'ctrl.productPickerShow': {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          this.init()
        }
      }
    },
  },
  data() {
    return {
      // columns: [],
      defaultIndex: [0, 0],
      pickerTitle: '',
      pickerOptions: [],
      pickerDefaultIndex: [],
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      ctrl: 'ctrl',
      receivingProducts: 'receivingProducts',
      products: 'products',
    }),
    columns() {
      let columns = []
      if (this.products.length > 0) {
        this.products.forEach((product) => {
          // options not in products add to columns
          if (this.receivingProducts.findIndex(item => item.skuCode === product.skuCode) < 0) {
            columns.push({
              label: `${product.name}(${product.skuCode})`,
              value: product
            })
          }
        })
      }
      // console.log('columns', columns)
      if (columns.length <= 0) {
        columns.push({
          label: 'No products available',
          value: null
        })
      } else {
        columns.unshift({
          label: 'Select Product',
          value: null
        })
      }
      return [columns]
    }
  },
  mounted() {
    console.log('register-event-onShow')
    this.init()
    uni.$on('onShow', () => {
      this.init()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    ...mapActions(useReceivingStore, {getProductListAction: 'getProductListAction'}),
    async init() {
      this.getProductListAction()
      // this.pickerOptions = [...this.columns]
      this.pickerDefaultIndex = this.defaultIndex
      this.pickerTitle = 'Add Product'
    },
    pickerConfirm(e) {
      if (e) {
        this.defaultIndex = e.indexs
        // this.setStockInForm(e.value[0].value)
        if (e.value[0].value) {
          let product = {...e.value[0].value}
          product.expectedQuantity = 10
          this.receivingProducts.push(product)
        } else {
          this.$msg('Please select a product')
          return
        }
      }
      // console.log(this.receivingProducts)
      this.ctrl.productPickerShow = false
    },
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
  