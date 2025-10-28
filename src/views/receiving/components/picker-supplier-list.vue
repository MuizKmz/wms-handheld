<template>
  <up-form ref="submitForm" :model="receivingForm" :rules="rules">
    <up-form-item
        :borderBottom="false"
        prop="supplierCode"
    >
      <view class="form-item" @click="onSupplier">
        <text class="label">Supplier:</text>
        <up-input v-model="receivingForm.supplierCode" border="none"
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
      let res = await this.$api.getSupplierList()
      let columns = []
      if (res.success) {
        res.data.forEach((item) => {
          columns.push({
            label: item.name,
            value: item.code,
            id: item.id
          })
        })
        this.columns = [columns]
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
  margin-bottom: 4px;
  width: 100%;

  .label {
    font-weight: 600;
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
  }

  .input-field,
  .select-field {
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 8px 10px;
    font-size: 13px;

    :deep(.input-right-icon) {
      .u-icon__icon {
        font-size: 12px !important;
      }

      margin-right: 4px !important;
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 12px !important;
  margin-left: 6px !important;
}

:deep(.u-form-item__body) {
  padding: 0px !important;
}

:deep(.u-form-item__body__right__message) {
  font-size: 10px !important;
  margin-left: 0px !important;
  margin-bottom: 4px !important;
}
</style>
  