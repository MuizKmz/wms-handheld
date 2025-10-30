<template>
  <view class="form-item">
    <text class="label">Received Date:</text>
    <up-input v-model="formattedDate" border="none" class="input-field" readonly
              placeholder="Auto-generated">
      <template #suffix>
        <up-icon name="calendar" size="18" color="#999"></up-icon>
      </template>
    </up-input>
  </view>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'
import dayjs from 'dayjs'

export default {
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    }),
    formattedDate() {
      return dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted() {
    this.receivingForm.dateReceived = this.formattedDate
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
    padding: 12px 14px;
    font-size: 14px;
    border: 1px solid #e8eaed;
    transition: all 0.2s ease;
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 14px !important;
  margin-left: 6px !important;
}
</style>
