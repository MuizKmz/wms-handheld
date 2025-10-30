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
import {useReceivingStore} from '@/store/receiving'
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
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    }),
    displayValue() {
      return this.receivingForm.warehouseCode || ''
    }
  },
  mounted() {
    this.getWarehouseList()
  },
  methods: {
    async getWarehouseList() {
      try {
        console.log('Fetching warehouse list...')
        const res = await warehouseApi.getWarehouseCodeNameList()
        console.log('Warehouse API response:', res)
        
        if (res && res.data) {
          this.list = res.data
          console.log('Warehouse list:', this.list)
          
          this.ctrl.options = this.list.map(item => ({
            id: item.id,
            label: item.warehouseCode,
            value: item.warehouseCode,
            name: item.name
          }))
          console.log('Warehouse options:', this.ctrl.options)
        } else {
          console.error('No data in response:', res)
          uni.showToast({
            title: 'No warehouses found',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('Failed to fetch warehouse list:', error)
        uni.showToast({
          title: 'Failed to load warehouses',
          icon: 'none'
        })
      }
    },
    showPicker() {
      const currentIndex = this.ctrl.options.findIndex(
        item => item.value === this.receivingForm.warehouseCode
      )
      this.ctrl.defaultIndex = currentIndex >= 0 ? currentIndex : 0
      this.ctrl.show = true
    },
    onConfirm(e) {
      const selected = e.value[0]
      this.receivingForm.warehouseId = selected.id
      this.receivingForm.warehouseCode = selected.value
      
      // Clear rack and section when warehouse changes
      this.receivingForm.rackId = ''
      this.receivingForm.rackCode = ''
      this.receivingForm.sectionId = ''
      this.receivingForm.sectionCode = ''
      
      this.ctrl.show = false
      
      // Emit event to trigger rack list refresh
      uni.$emit('warehouseChanged', selected.id)
    },
    onCancel() {
      this.ctrl.show = false
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  display: flex;
  flex-direction: column;
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
    cursor: pointer;
  }

  .input-right-icon {
    color: #999;
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 14px !important;
  margin-left: 6px !important;
}

:deep(.u-input__content) {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
}
</style>
