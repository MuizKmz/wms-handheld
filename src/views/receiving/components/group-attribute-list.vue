<template>
  <up-form v-if="submitAttributes.length > 0" ref="submitForm" :model="formData" :rules="rules">
    <up-form-item
        v-for="(item,index) in submitAttributes" :key="index"
        :borderBottom="false"
        :prop="item.attributeCode"
    >
      <div class="form-item" @click="onAttribute(item)">
        <text class="label">{{ item.attributeName }}:</text>
        <up-input v-if="item.elComponent === 'el-input' || item.elComponent === 'el-autocomplete'"
                  v-model="formData[item.attributeCode]"
                  :placeholder="` Key in ${item.attributeName}`" border="none"
                  class="input-field" @change="(value) => onAttributeChange(item,value)">
          <template #suffix>
            <up-button
                icon="scan"
                shape="square"
                size="mini"
                text="SCAN"
                type="primary"
                @click="onScanCode(item)"
            ></up-button>
          </template>
        </up-input>
        <up-input v-if="item.elComponent === 'el-date-picker'" v-model="formData[item.attributeCode]"
                  border="none" class="input-field"
                  placeholder=" Key in">
          <template #suffix>
            <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
          </template>
        </up-input>
        <up-datetime-picker
            v-if="item.elComponent === 'el-date-picker'"
            v-model="item.value"
            :show="item.show"
            mode="date"
            @cancel="(e)=>onDatePick(e,item)" @close="(e)=>onDatePick(e,item)" @confirm="(e)=>onDatePick(e,item)"
        ></up-datetime-picker>
      </div>
    </up-form-item>
  </up-form>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'
import dayjs from 'dayjs'

export default {
  props: {},
  watch: {
    attributeValues: {
      async handler(newVal) {
        let form = {}
        if (newVal) {
          if (newVal) {
            newVal.forEach(item => {
              form[item.attributeCode] = item.value
            })
          }
        }
        this.form = form
      },
      immediate: true,
      deep: true,
    },
    attributeList: {
      handler(val) {
        if (val) {
          let submitAttributes = []
          let formData = {}
          val.forEach(attribute => {
            let submitAttribute = {
              targetId: this.targetId || '',
              attributeId: attribute.id,
              attributeCode: attribute.code,
              attributeName: attribute.name,
              elComponent: attribute.elComponent || 'el-input',
              value: attribute.elComponent === 'el-date-picker' ? new Date().getTime() : '',
              valueTxt: '',
              sort: attribute.sort
            }
            if (this.attributeValues) {
              this.attributeValues.forEach(attributeValue => {
                if (attributeValue.attributeId === attribute.id) {
                  submitAttribute.id = attributeValue.id
                  submitAttribute.value = attributeValue.value
                }
              })
            }
            if (attribute.elComponent === 'el-date-picker') {
              formData[attribute.code] = dayjs(submitAttribute.value).format('YYYY-MM-DD')
            } else {
              formData[attribute.code] = submitAttribute.value
            }

            submitAttributes.push(submitAttribute)
          })
          this.formData = formData
          this.submitAttributes = submitAttributes
          if (submitAttributes.length > 0) {
            this.getRules(submitAttributes)
            this.updateSubmitAttributes()
          }
        }
      },
      immediate: true,
      deep: true,
    }
  },
  data() {
    return {
      formData: {},
      submitAttributes: [],
      // Options for select dropdowns
      attributeList: [],
      columns: [],
      rules: [],
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
      attributeValues: 'attributeValues',
    }),
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      this.getAttributes()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    // ...mapActions(useReceivingStore, {getReceivingList: 'getReceivingListAction'}),
    getRules(submitAttributes) {
      let rules = {}
      submitAttributes.forEach(item => {
        rules[item.attributeCode] = {
          type: 'string',
          required: true,
          message: `Please key-in ${item.attributeName}`,
          trigger: ['change', 'blur'],
        }
      })
      this.rules = rules
      // this.$refs.submitForm.setRules(rules)
    },
    onAttribute(item) {
      if (item.elComponent === 'el-date-picker') {
        item.show = true
      }
    },
    onScanCode(item) {
      uni.scanCode(
          {
            autoZoom: true,
            success: (res) => {
              console.log('条码类型：' + res.scanType)
              console.log('条码内容：' + res.result)
              if (this.type === 0) {
                item.value = res.result
              } else {
                // this.receivingForm.orderCode = res.result
              }
            }
          }
      )
    },
    onDatePick(e, item) {
      if (e) {
        // this.defaultIndex = e.indexs
        item.value = e.value
        item.valueTxt = dayjs(e.value).format('YYYY-MM-DD')
        this.formData[item.attributeCode] = item.valueTxt
        this.updateSubmitAttributes()
      }
      item.show = false
    },
    async getAttributes() {
      let res = await this.$api.getReceivingAttributeList()
      if (res.success) {
        this.attributeList = res.data
      }
    },

    onAttributeChange(item, value) {
      item.value = value
      this.updateSubmitAttributes()
    },

    updateSubmitAttributes() {
      if (!this.submitAttributes || this.submitAttributes.length === 0) {
        return
      }
      let submitAttributes = this.$deepClone(this.submitAttributes)
      submitAttributes.forEach(item => {
        delete item.attributeCode
        delete item.attributeName
      })
      this.attributeValues = [...submitAttributes]
      this.$emit('onChange', submitAttributes)
    },

    validate() {
      return new Promise((resolve, reject) => {
        this.$refs.submitForm.validate().then((res) => {
          // console.log(res)
          resolve(true)
        }).catch(errors => {
          // console.log(errors)
          resolve(false)
        })
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
  