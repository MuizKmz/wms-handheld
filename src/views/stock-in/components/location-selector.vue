<template>
  <view class="form-item" @click="showPicker">
    <text class="label">Location (Optional):</text>
    <up-input v-model="displayValue" border="none" class="input-field" clearable
              placeholder="Select Location" readonly :disabled="!stockInForm.warehouseId">
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
            :title="'Select Location'"
            :visibleItemCount="7"
            keyName="label"
            @cancel="onCancel" 
            @confirm="onConfirm">
  </u-picker>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'
import locationApi from '@/api/location'

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
      return this.stockInForm.locationCode || ''
    }
  },
  watch: {
    'stockInForm.warehouseId': {
      handler(newVal) {
        if (newVal) {
          this.getLocationList(newVal)
        } else {
          this.list = []
          this.ctrl.options = []
        }
      },
      immediate: true
    }
  },
  methods: {
    async getLocationList(warehouseId) {
      if (!warehouseId) {
        this.list = []
        this.ctrl.options = []
        return
      }
      try {
        const res = await locationApi.getLocationListByWarehouse(warehouseId)
        if (res && res.data) {
          this.list = res.data
          this.ctrl.options = this.list.map(item => ({
            id: item.id,
            label: item.locationCode || item.locationName || 'N/A',
            value: item.locationCode || ''
          }))
        } else {
          this.ctrl.options = []
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error)
        this.ctrl.options = []
      }
    },
    
    showPicker() {
      if (!this.stockInForm.warehouseId) {
        uni.showToast({
          title: 'Please select warehouse first',
          icon: 'none'
        })
        return
      }
      
      if (this.ctrl.options.length === 0) {
        uni.showToast({
          title: 'No locations available',
          icon: 'none'
        })
        return
      }
      
      // Find current selected index
      const currentIndex = this.list.findIndex(item => item.id === this.stockInForm.locationId)
      this.ctrl.defaultIndex = currentIndex >= 0 ? currentIndex : 0
      this.ctrl.show = true
    },
    
    onConfirm(e) {
      const selected = this.list[e.indexs[0]]
      if (selected) {
        this.stockInForm.locationId = selected.id
        this.stockInForm.locationCode = selected.locationCode || ''
        this.stockInForm.locationName = selected.locationName || selected.name || ''
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
