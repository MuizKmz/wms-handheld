<template>
  <up-form ref="submitForm" :model="receivingForm" :rules="rules">
    <up-form-item
        :borderBottom="false"
        prop="code"
    >
      <view class="form-item">
        <text class="label">Receiving Code:</text>
        <up-input v-model="receivingForm.code" border="none" class="input-field"
                  placeholder=" Key in receiving code">
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
  props: {
    // doNumber: {
    //   type: String,
    //   default: ''
    // }
  },
  watch: {},
  data() {
    return {
      columns: [],
      defaultIndex: [0, 0, 0],
      defaultOption: {
        label: 'Default',
        value: ''
      },
      rules: {
        code: [
          {required: true, message: 'Please key-in receiving code', trigger: ['change', 'blur']},
        ]
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
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    onScanCode() {
      uni.scanCode(
          {
            autoZoom: false,
            success: (res) => {
              console.log('条码类型：' + res.scanType)
              console.log('条码内容：' + res.result)
              if (this.type === 0) {
                this.receivingForm.code = res.result
              } else {
                // this.receivingForm.orderCode = res.result
              }
            }
          }
      )
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
  