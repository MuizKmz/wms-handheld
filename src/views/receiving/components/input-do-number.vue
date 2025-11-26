<template>
  <up-form ref="submitForm" :model="receivingForm" :rules="rules">
    <up-form-item
        :borderBottom="false"
        prop="doNumber"
    >
      <view class="form-item">
        <text class="label">DO Number:</text>
        <text class="label-hint">(From Supplier's Delivery Note)</text>
        <up-input v-model="receivingForm.doNumber" border="none" class="input-field"
                  placeholder="Key in DO Number from delivery note">
        </up-input>
      </view>
    </up-form-item>
  </up-form>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  name: 'InputDONumber',
  data() {
    return {
      rules: {
        doNumber: [
          {required: true, message: 'Please enter DO Number from supplier', trigger: ['change', 'blur']},
        ]
      }
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    })
  },
  mounted() {
    console.log('DO Number input component mounted')
  },
  methods: {
    validate() {
      return new Promise((resolve) => {
        this.$refs.submitForm.validate().then(() => {
          resolve(true)
        }).catch(() => {
          resolve(false)
        })
      })
    },
    
    reset() {
      this.receivingForm.doNumber = ''
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
    margin-bottom: 4px;
    font-size: 14px;
    color: #333;
  }
  
  .label-hint {
    font-weight: 400;
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

  .input-field,
  .select-field {
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

:deep(.u-input__content) {
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
}
</style>
