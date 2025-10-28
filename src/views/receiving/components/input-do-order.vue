<template>
  <up-form ref="submitForm" :model="receivingForm" :rules="rules">
    <up-form-item
        :borderBottom="false"
        prop="doNumber"
    >
      <view class="form-item">
        <text class="label">{{ title }}:</text>
        <up-input v-if="type === 0" v-model="receivingForm.doNumber" border="none" class="input-field"
                  placeholder=" Key in DO No.">
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
    /**
     * type: 0: DO, 1: Order
     */
    type: {
      type: Number,
      default: 0
    }
    // doNumber: {
    //   type: String,
    //   default: ''
    // }
  },
  watch: {
    // 'receivingForm.doNumber': {
    //   immediate: true,
    //   deep: true,
    //   handler(newVal) {
    //     this.getReceivingList()
    //   }
    // }
  },
  data() {
    return {
      rules: {
        doNumber: [
          {required: true, message: 'Please select DO No.', trigger: ['change', 'blur']},
        ]
      },
      code: '',
    }
  },
  computed: {
    ...mapWritableState(useReceivingStore, {
      receivingForm: 'receivingForm'
    }),
    title() {
      return this.type === 0 ? 'DO No.' : 'Order No.'
    }
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      // this.getReceivingList()
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
                this.receivingForm.doNumber = res.result
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
    resetForm() {
      this.receivingForm.doNumber = ''
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
  