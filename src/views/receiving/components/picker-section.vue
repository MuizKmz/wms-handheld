<template>
  <view class="form-item" @click="showPicker">
    <text class="label">Section:</text>
    <up-input v-model="displayValue" border="none" class="input-field" clearable
              placeholder="Select Section" readonly :disabled="!receivingForm.rackId">
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
            :title="'Select Section'"
            :visibleItemCount="7"
            keyName="label"
            @cancel="onCancel" 
            @confirm="onConfirm">
  </u-picker>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'
import sectionApi from '@/api/section'

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
      return this.receivingForm.sectionCode || ''
    }
  },
  mounted() {
    uni.$on('rackChanged', (rackId) => {
      this.getSectionList(rackId)
    })
  },
  beforeUnmount() {
    uni.$off('rackChanged')
  },
  methods: {
    async getSectionList(rackId) {
      if (!rackId) {
        this.list = []
        this.ctrl.options = []
        return
      }
      
      try {
        console.log('Fetching section list for rack:', rackId)
        const res = await sectionApi.getSectionListByRack(rackId)
        console.log('Section API response:', res)
        
        if (res && res.data) {
          this.list = res.data
          console.log('Section list:', this.list)
          
          this.ctrl.options = this.list.map(item => ({
            id: item.id,
            label: item.sectionCode,
            value: item.sectionCode,
            name: item.sectionName
          }))
          console.log('Section options:', this.ctrl.options)
        } else {
          console.error('No data in response:', res)
          this.ctrl.options = []
        }
      } catch (error) {
        console.error('Failed to fetch section list:', error)
        this.$msg('Failed to load sections')
      }
    },
    showPicker() {
      if (!this.receivingForm.rackId) {
        this.$msg('Please select rack first')
        return
      }
      
      if (this.ctrl.options.length === 0) {
        this.getSectionList(this.receivingForm.rackId)
      }
      
      const currentIndex = this.ctrl.options.findIndex(
        item => item.value === this.receivingForm.sectionCode
      )
      this.ctrl.defaultIndex = currentIndex >= 0 ? currentIndex : 0
      this.ctrl.show = true
    },
    onConfirm(e) {
      const selected = e.value[0]
      this.receivingForm.sectionId = selected.id
      this.receivingForm.sectionCode = selected.value
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
</style>
