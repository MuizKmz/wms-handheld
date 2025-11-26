<template>
  <view class="form-item">
    <text class="label">Return Type<text class="required">*</text></text>
    <up-radio-group v-model="stockReturnForm.returnType" placement="row" @change="onReturnTypeChange">
      <up-radio 
        label="Customer Return" 
        name="CUSTOMER_RETURN"
        :customStyle="{ marginRight: '16px', fontSize: '14px' }"
      ></up-radio>
      <up-radio 
        label="Supplier Return" 
        name="SUPPLIER_RETURN"
        :customStyle="{ fontSize: '14px' }"
      ></up-radio>
    </up-radio-group>
  </view>
</template>

<script>
import { mapWritableState } from 'pinia'
import { useStockStore } from '@/store/stock'

export default {
  computed: {
    ...mapWritableState(useStockStore, {
      stockReturnForm: 'stockReturnForm'
    })
  },
  methods: {
    onReturnTypeChange(value) {
      // Clear reference order when return type changes
      this.stockReturnForm.orderId = null
      this.stockReturnForm.receivingId = null
      this.stockReturnForm.customerId = null
      this.stockReturnForm.supplierId = null
      
      console.log('Return type changed to:', value)
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
    
    .required {
      color: #f56c6c;
      margin-left: 2px;
    }
  }
  
  :deep(.u-radio-group) {
    padding: 8px 0;
  }
  
  :deep(.u-radio) {
    margin-right: 20px;
  }
}
</style>
