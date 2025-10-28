<template>
  <view class="form-item">
    <text class="label">Received By:</text>
    <up-input v-model="receivingForm.receivedBy" border="none" class="input-field"
              placeholder=" Enter receiver name">
    </up-input>
  </view>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    })
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  margin-bottom: 4px;
  width: 100%;

  .label {
    font-weight: 600;
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: #333;
  }

  .input-field {
    background-color: #f8f8f8;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 13px;
    border: 1px solid #e8e8e8;
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 13px !important;
  margin-left: 6px !important;
}
</style>
