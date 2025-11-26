<template>
  <view class="form-item" @click="showPicker">
    <text class="label">Location (Optional):</text>
    <up-input v-model="displayValue" border="none" class="input-field" clearable
              placeholder="Select Location" readonly :disabled="!receivingForm.warehouseId">
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
import {useReceivingStore} from '@/store/receiving'
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
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    }),
    displayValue() {
      return this.receivingForm.locationCode || ''
    }
  },
  mounted() {
    uni.$on('warehouseChanged', (warehouseId) => {
      this.getLocationList(warehouseId)
    })
  },
  beforeUnmount() {
    uni.$off('warehouseChanged')
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
            label: item.locationCode || item.locationName || item.name || item.locationCode || 'N/A',
            value: item.locationCode || item.locationName || item.name || ''
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
      if (!this.receivingForm.warehouseId) {
        this.$msg('Please select warehouse first')
        return
      }
      if (this.ctrl.options.length === 0) {
        this.getLocationList(this.receivingForm.warehouseId)
      }
      const currentIndex = this.ctrl.options.findIndex(
        item => item.id === this.receivingForm.locationId
      )
      this.ctrl.defaultIndex = currentIndex >= 0 ? currentIndex : 0
      this.ctrl.show = true
    },
    onConfirm(e) {
      const selected = e.value[0]
      this.receivingForm.locationId = selected.id
      this.receivingForm.locationCode = selected.value
      this.ctrl.show = false
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
</style>
