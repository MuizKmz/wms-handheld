<template>
  <up-form ref="submitForm" :model="receivingForm" :rules="rules">
    <up-form-item
        :borderBottom="false"
        prop="supplierCode"
    >
      <view class="form-item" @click="onSupplier">
        <text class="label">Supplier Name:</text>
        <up-input v-model="receivingForm.supplierName" border="none"
                  class="input-field"
                  placeholder=" Select supplier"
                  readonly>
          <template #suffix>
            <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
          </template>
        </up-input>
      </view>
    </up-form-item>
  </up-form>
  <u-picker v-if="ctrl.pickerShow" ref="uPicker" :cancelText="'Cancel'" :closeOnClickOverlay="true"
            :columns="ctrl.pickerOptions" :confirmText="'Confirm'"
            :defaultIndex="ctrl.pickerDefaultIndex" :immediateChange="true"
            :show="ctrl.pickerShow" :title="ctrl.pickerTitle" :visibleItemCount="7"
            keyName="label"
            @cancel="pickerConfirm" @close="pickerConfirm" @confirm="pickerConfirm"></u-picker>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'
import supplierApi from '@/api/supplier'

export default {
  props: {},
  watch: {},
  data() {
    return {
      rules: {
        supplierCode: [
          {required: true, message: 'Please select a supplier', trigger: 'change'}
        ]
      },
      columns: [],
      list: [],
      defaultIndex: [0, 0, 0],
      defaultOption: {
        label: 'Default',
        value: ''
      },
      ctrl: {
        pickerTitle: '',
        pickerOptions: [],
        pickerDefaultIndex: [],
        pickerShow: false
      }
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm',
    }),
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      this.getSupplierList()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    onSupplier() {
      this.ctrl.pickerOptions = [...this.columns]
      this.ctrl.pickerDefaultIndex = this.defaultIndex
      this.ctrl.pickerTitle = 'Supplier for Receiving'
      this.ctrl.pickerShow = true
    },

    async getSupplierList() {
      try {
        let res = await supplierApi.getSupplierList()
        console.log('Supplier API response:', res)
        let columns = []
        if (res && res.data) {
          res.data.forEach((item) => {
            columns.push({
              label: item.supplierName,
              value: item.supplierCode,
              id: item.id
            })
          })
          this.columns = [columns]
          console.log('Supplier columns:', this.columns)
        }
      } catch (error) {
        console.error('Failed to fetch supplier list:', error)
        this.$msg('Failed to load suppliers')
      }
    },

    pickerConfirm(e) {
      if (e) {
        this.defaultIndex = e.indexs
        this.receivingForm.supplierId = e.value[0].id
        this.receivingForm.supplierCode = e.value[0].value
        this.receivingForm.supplierName = e.value[0].label
        // this.$emit('pickConfirm', this.receivingForm)
      }
      this.ctrl.pickerShow = false
    },

    validate() {
      return new Promise((resolve) => {
        this.$refs.submitForm.validate().then(() => {
          // console.log(res)
          resolve(true)
        }).catch(() => {
          // console.log(errors)
          resolve(false)
        })
      })
    },

    resetForm() {
      this.receivingForm.supplierCode = ''
      this.receivingForm.supplierName = ''
      // this.$emit('pickConfirm', this.receivingForm)
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
    cursor: pointer;

    &:active {
      background-color: #f0f2f5;
      border-color: #667eea;
    }

    :deep(.input-right-icon) {
      .u-icon__icon {
        font-size: 14px !important;
      }

      margin-right: 4px !important;
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 14px !important;
  margin-left: 6px !important;
}

:deep(.u-form-item__body) {
  padding: 0px !important;
}

:deep(.u-form-item__body__right__message) {
  font-size: 12px !important;
  margin-left: 0px !important;
  margin-bottom: 6px !important;
  color: #ff4d4f;
  font-weight: 500;
}
</style>
  