<template>
  <view class="form-item" @click="showPicker">
    <text class="label">Rack:</text>
    <up-input v-model="displayValue" border="none" class="input-field" clearable
              placeholder="Select Rack" readonly :disabled="!receivingForm.warehouseId">
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
            :title="'Select Rack'"
            :visibleItemCount="7"
            keyName="label"
            @cancel="onCancel" 
            @confirm="onConfirm">
  </u-picker>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'
import rackApi from '@/api/rack'

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
      return this.receivingForm.rackCode || ''
    }
  },
  mounted() {
    uni.$on('warehouseChanged', (warehouseId) => {
      this.getRackList(warehouseId)
    })
  },
  beforeUnmount() {
    uni.$off('warehouseChanged')
  },
  methods: {
    async getRackList(warehouseId) {
      if (!warehouseId) {
        this.list = []
        this.ctrl.options = []
        return
      }
      
      try {
        console.log('Fetching rack list for warehouse:', warehouseId)
        const res = await rackApi.getRackListByWarehouse(warehouseId)
        console.log('Rack API response:', res)
        
        if (res && res.data) {
          this.list = res.data
          console.log('Rack list:', this.list)
          
          this.ctrl.options = this.list.map(item => ({
            id: item.id,
            label: item.rackCode,
            value: item.rackCode,
            name: item.rackName
          }))
          console.log('Rack options:', this.ctrl.options)
        } else {
          console.error('No data in response:', res)
          this.ctrl.options = []
        }
      } catch (error) {
        console.error('Failed to fetch rack list:', error)
        uni.showToast({
          title: 'Failed to load racks',
          icon: 'none'
        })
      }
    },
    showPicker() {
      if (!this.receivingForm.warehouseId) {
        uni.showToast({
          title: 'Please select warehouse first',
          icon: 'none'
        })
        return
      }
      
      if (this.ctrl.options.length === 0) {
        this.getRackList(this.receivingForm.warehouseId)
      }
      
      const currentIndex = this.ctrl.options.findIndex(
        item => item.value === this.receivingForm.rackCode
      )
      this.ctrl.defaultIndex = currentIndex >= 0 ? currentIndex : 0
      this.ctrl.show = true
    },
    onConfirm(e) {
      const selected = e.value[0]
      this.receivingForm.rackId = selected.id
      this.receivingForm.rackCode = selected.value
      
      // Clear section when rack changes
      this.receivingForm.sectionId = ''
      this.receivingForm.sectionCode = ''
      
      this.ctrl.show = false
      
      // Emit event to trigger section list refresh
      uni.$emit('rackChanged', selected.id)
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

:deep(.u-input--disabled) {
  opacity: 0.6;
}

:deep(.u-input--disabled) {
  background-color: #f5f5f5 !important;
}
</style>
