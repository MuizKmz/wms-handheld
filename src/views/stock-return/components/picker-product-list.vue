<template>
  <view class="form-item" @click="onProductPicker">
    <text class="label">Product SKU</text>
    <up-input v-model="selectedProductDisplay" border="none" class="input-field"
              clearable
              placeholder="Select product from order" readonly>
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
            @cancel="pickerClose" @close="pickerClose" @confirm="pickerConfirm"></u-picker>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

export default {
  watch: {
    'stockReturnForm.referenceNumber': {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && this.selectedOrder) {
          // Rebuild product columns when reference order changes
          this.buildProductColumns()
        } else {
          this.columns = []
        }
      }
    },
    'selectedOrder': {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && newVal.orderItems) {
          console.log('📦 Selected order updated, rebuilding product columns')
          this.buildProductColumns()
        }
      }
    }
  },
  data() {
    return {
      columns: [],
      defaultIndex: [0],
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
      stockReturnForm: 'stockReturnForm',
      selectedOrder: 'selectedOrder',
      selectedProduct: 'selectedProduct'
    }),
    selectedProductDisplay() {
      if (this.selectedProduct) {
        return `${this.selectedProduct.product?.name || this.selectedProduct.name} (${this.selectedProduct.product?.skuCode || this.selectedProduct.skuCode})`
      }
      return ''
    },
    availableProducts() {
      if (!this.selectedOrder || !this.selectedOrder.orderItems) {
        return []
      }
      return this.selectedOrder.orderItems
    }
  },
  mounted() {
    console.log('picker-product-list mounted')
  },
  methods: {
    buildProductColumns() {
      let columns = []
      if (this.availableProducts.length > 0) {
        this.availableProducts.forEach((item) => {
          const productName = item.product?.name || item.name || 'Unknown'
          const skuCode = item.product?.skuCode || item.skuCode || 'N/A'
          const quantity = item.quantity || 0
          
          columns.push({
            label: `${productName} (${skuCode}) - Qty: ${quantity}`,
            value: item
          })
        })
      }
      this.columns = [columns]
    },
    onProductPicker() {
      if (!this.stockReturnForm.referenceNumber) {
        this.$msg('Please select SO/PO first')
        return
      }
      if (this.availableProducts.length <= 0) {
        this.$msg('No products available in selected order')
        return
      }
      
      this.buildProductColumns()
      this.ctrl.pickerOptions = [...this.columns]
      this.ctrl.pickerDefaultIndex = this.defaultIndex
      this.ctrl.pickerTitle = 'Select Product'
      this.ctrl.pickerShow = true
    },
    pickerConfirm(e) {
      console.log('Product selected:', e)
      if (e && e.value && e.value[0]) {
        this.defaultIndex = e.indexs
        this.selectProduct(e.value[0].value)
      }
      this.ctrl.pickerShow = false
    },
    pickerClose() {
      this.ctrl.pickerShow = false
    },
    selectProduct(product) {
      console.log('Setting selected product:', product)
      this.selectedProduct = product
      
      // Clear scanned tags when product changes
      this.$emit('product-changed', product)
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
    padding: 0 12px;
    
    :deep(.u-input__content__field-wrapper__field) {
      font-size: 14px;
    }
  }

  .input-right-icon {
    color: #999;
  }
}
</style>
