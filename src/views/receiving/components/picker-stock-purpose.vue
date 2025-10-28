<template>
  <up-form ref="submitForm" :model="receivingForm" :rules="rules">
    <up-form-item
        :borderBottom="false"
        prop="stockPurposeName"
    >
      <view class="form-item" @click="onPurpose">
        <text class="label">Receiving Purpose:</text>
        <up-input v-model="receivingForm.stockPurposeName" border="none" class="input-field"
                  placeholder=" Select receiving purpose"
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
  props: {
    // doNumber: {
    //   type: String,
    //   default: ''
    // }
  },
  watch: {
    // doNumber: {
    //   immediate: true,
    //   handler(newVal) {
    //   }
    // }
  },
  data() {
    return {
      rules: {
        stockPurposeName: [
          {required: true, message: 'Please select stock-in purpose', trigger: 'change'}
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
      receivingForm: 'receivingForm'
    }),
  },
  mounted() {
    this.getPurposeList()
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    onPurpose() {
      this.ctrl.pickerOptions = [...this.columns]
      this.ctrl.pickerDefaultIndex = this.defaultIndex
      this.ctrl.pickerTitle = 'Purpose of Receiving'
      this.ctrl.pickerShow = true
    },

    async getPurposeList() {
      // Hardcoded options for Receiving Purpose
      const purposes = [
        { id: 1, name: 'Raw Material', code: 'RAW_MATERIAL' },
        { id: 2, name: 'Finished Goods', code: 'FINISHED_GOODS' }
      ]
      
      let columns = []
      purposes.forEach((item) => {
        columns.push({
          id: item.id,
          label: item.name,
          value: item.code
        })
      })
      this.columns = [columns]
    },

    pickerConfirm(e) {
      if (e) {
        this.defaultIndex = e.indexs
        this.receivingForm.stockPurposeId = e.value[0].id
        this.receivingForm.stockPurposeCode = e.value[0].value
        this.receivingForm.stockPurposeName = e.value[0].label
        this.validate()
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
      this.receivingForm.stockPurposeCode = ''
      this.receivingForm.stockPurposeName = ''
      // this.$emit('pickConfirm', this.receivingForm)
    }
  }
}
</script>
<style lang="scss" scoped>
.form-item {
  margin-bottom: 12px;
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

    :deep(.input-right-icon) {
      .u-icon__icon {
        font-size: 12px !important;
      }

      margin-right: 4px !important;
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 13px !important;
  margin-left: 6px !important;
}

:deep(.u-form-item__body) {
  padding: 0px !important;
}

:deep(.u-form-item__body__right__message) {
  font-size: 11px !important;
  margin-left: 0px !important;
  margin-bottom: 4px !important;
}
</style>
  