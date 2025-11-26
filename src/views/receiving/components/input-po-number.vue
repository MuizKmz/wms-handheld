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
  watch: {
    'receivingForm.poNumber': {
      immediate: false,
      handler(newVal) {
        if (newVal) {
          this.receivingForm.doNumber = ''
        }
      }
    }
  },
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
          const po = res.result
          // Clear DO when PO scanned
          this.receivingForm.doNumber = ''
          this.receivingForm.poNumber = po
          // Try to fetch order details for the PO as well
          if (this.$parent && this.$parent.$refs && this.$parent.$refs.doNumber) {
            // reuse fetchOrderDetails if available on the doNumber component
            try {
              this.$parent.$refs.doNumber.fetchOrderDetails(po)
            } catch {
              // ignore if not available
            }
          }
        }
      })
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
  }

  .input-field {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 12px 14px;
    font-size: 14px;
    border: 1px solid #e8eaed;
    transition: all 0.2s ease;

    &:focus-within {
      background-color: #fff;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 14px !important;
  margin-left: 6px !important;
}
</style>
