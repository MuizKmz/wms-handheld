<template>
  <view class="form-item" @click="onPurpose">
    <text class="label">Purpose of Stock In:</text>
    <up-input v-model="stockInForm.stockPurposeName" border="none" class="input-field"
              placeholder=" Select stock-in purpose"
              readonly>
      <template #suffix>
        <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
      </template>
    </up-input>
  </view>
  <u-picker v-if="ctrl.pickerShow" ref="uPicker" :cancelText="'Cancel'" :closeOnClickOverlay="true"
            :columns="ctrl.pickerOptions" :confirmText="'Confirm'"
            :defaultIndex="ctrl.pickerDefaultIndex" :immediateChange="true"
            :show="ctrl.pickerShow" :title="ctrl.pickerTitle" :visibleItemCount="7"
            keyName="label"
            @cancel="pickerConfirm" @close="pickerConfirm" @confirm="pickerConfirm"></u-picker>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

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
      // stockInForm: {
      //   stockPurposeCode: '',
      //   stockPurposeName: ''
      // },
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
    ...mapWritableState(useStockStore, {
      stockInForm: 'stockInForm',
      scannedTags: 'scannedTags',
      receivingProducts: 'receivingProducts'
    }),
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      this.getPurposeList()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    onPurpose() {
      this.ctrl.pickerOptions = [...this.columns]
      this.ctrl.pickerDefaultIndex = this.defaultIndex
      this.ctrl.pickerTitle = 'Purpose of Stock In'
      this.ctrl.pickerShow = true
    },

    async getPurposeList() {
      let res = await this.$api.getStockPurposeList()
      let columns = []
      if (res.success) {
        res.data.forEach((item) => {
          columns.push({
            label: item.name,
            value: item.code
          })
        })
        this.columns = [columns]
      }
    },

    pickerConfirm(e) {
      if (e) {
        this.defaultIndex = e.indexs
        this.stockInForm.stockPurposeCode = e.value[0].value
        this.stockInForm.stockPurposeName = e.value[0].label
        // this.$emit('pickConfirm', this.stockInForm)
      }
      this.ctrl.pickerShow = false
    },

    resetForm() {
      this.stockInForm.stockPurposeCode = ''
      this.stockInForm.stockPurposeName = ''
      // this.$emit('pickConfirm', this.stockInForm)
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
</style>
  