<template>
  <view class="form-item" @click="showPicker">
    <text class="label">Warehouse:</text>
    <up-input v-model="displayValue" border="none" class="input-field" clearable
              placeholder="Select Warehouse" readonly>
      <template #suffix>
        <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
      </template>
    </up-input>
  </view>
  <u-picker v-if="ctrl.show" ref="uPicker" 
            :cancelText="'Cancel'" 
            :closeOnClickOverlay="true"
            :columns="[ctrl.options]" 
            :confirmText="'Confirm'"
            :defaultIndex="[ctrl.defaultIndex]" 
            :show="ctrl.show" 
            :title="'Select Warehouse'"
            :visibleItemCount="7"
            keyName="label"
            @cancel="onCancel" 
            @confirm="onConfirm">
  </u-picker>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'
import warehouseApi from '@/api/warehouse'

export default {
  data() {
    return {
      list: [],
      ctrl: {
        show: false,
        options: [],
        defaultIndex: 0
      }
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm'
    }),
    displayValue() {
      return this.stockInForm.warehouseCode || ''
    }
  },
  mounted() {
    this.getWarehouseList()
  },
  methods: {
    async getWarehouseList() {
      try {
        const res = await warehouseApi.getWarehouseCodeNameList()
        if (res && res.data) {
          this.list = res.data
          this.ctrl.options = this.list.map(item => ({
            id: item.id,
            label: item.warehouseCode,
            value: item.warehouseCode,
            name: item.name
          }))
        } else {
          this.$msg('No warehouses found')
        }
      } catch (error) {
        console.error('Failed to fetch warehouse list:', error)
        this.$msg('Failed to load warehouses')
      }
    },
    
    showPicker() {
      if (this.ctrl.options.length === 0) {
        this.$msg('No warehouses available')
        return
      }
      
      // Find current selected index
      const currentIndex = this.list.findIndex(item => item.id === this.stockInForm.warehouseId)
      this.ctrl.defaultIndex = currentIndex >= 0 ? currentIndex : 0
      this.ctrl.show = true
    },
    
    onConfirm(e) {
      const selected = this.list[e.indexs[0]]
      if (selected) {
        this.stockInForm.warehouseId = selected.id
        this.stockInForm.warehouseCode = selected.warehouseCode
        this.stockInForm.warehouseName = selected.name
      }
      this.ctrl.show = false
    },
    
    onCancel() {
      this.ctrl.show = false
    }
  }
}
</script>

<style scoped lang="scss">
.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  .label {
    min-width: 200rpx;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }

  .input-field {
    flex: 1;
    font-size: 28rpx;
  }

  .input-right-icon {
    color: #999;
  }
}
</style>
