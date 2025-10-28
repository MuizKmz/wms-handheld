<template>
  <up-form ref="submitForm" :model="receivingForm">
    <up-form-item :borderBottom="false">
      <view class="form-item">
        <text class="label">PO Number:</text>
        <up-input v-model="receivingForm.poNumber" border="none" class="input-field"
                  placeholder=" Key in PO No. (Optional)">
          <template #suffix>
            <up-button
                icon="scan"
                shape="square"
                size="mini"
                text="SCAN"
                type="primary"
                @click="onScanCode"
            ></up-button>
          </template>
        </up-input>
      </view>
    </up-form-item>
  </up-form>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    })
  },
  methods: {
    onScanCode() {
      uni.scanCode({
        autoZoom: false,
        success: (res) => {
          this.receivingForm.poNumber = res.result
        }
      })
    }
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
