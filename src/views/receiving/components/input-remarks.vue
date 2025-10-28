<template>
  <up-form ref="submitForm" :model="receivingForm">
    <up-form-item
        :borderBottom="false"
    >
      <view class="form-item">
        <text class="label">{{ title }}:</text>
        <up-input v-model="receivingForm.remark" border="none" class="input-field"
                  placeholder=" Optional">
        </up-input>
      </view>
    </up-form-item>
  </up-form>
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
        remark: [
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
      return 'Remarks'
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
      this.receivingForm.remark = ''
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
  