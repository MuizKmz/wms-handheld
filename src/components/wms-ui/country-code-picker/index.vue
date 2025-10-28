<template>
  <!--  $t('uview.common.confirmText')-->
  <!--  $t('uview.common.cancelText')-->
  <!--  $t('common.page.country-code.picker-title')-->
  <u-picker :show="true" ref="uPicker" :title="'更改所在国家或地区'"
            :confirmText="'确认'" :cancelText="'取消'"
            :columns="countryCodePicker.columns" :defaultIndex="countryCodePicker.defaultIndex"
            @confirm="countryCodeConfirm" @cancel="countryCodeConfirm" @close="countryCodeConfirm"
            :visibleItemCount="7"
            :closeOnClickOverlay="true" :immediateChange="true" keyName="label"></u-picker>
</template>

<script>
export default {
  name: 'country-code-picker',
  props: {
    defaultCode: {
      type: String,
      default: '60'
    }
  },
  data() {
    return {
      countryCodePicker: {
        // showCountryCode: true,
        defaultIndex: [],
        columns: [],
      },
    }
  },
  async mounted() {
    // console.log(this.countryCodePicker.defaultIndex)
    let res = await this.$api.getDicList('COUNTRY_CODE')
    let countryCodes = []
    this.$countryCodes().forEach((item, index) => {
      res.data.forEach(dict => {
        if (item.value == dict.code) {
          let jsonParam = JSON.parse(dict.extraData)
          countryCodes.push({
            label: item.label,
            value: item.value,
            regex: jsonParam.regex
          })
        }
      })
    })
    countryCodes.forEach((item, index) => {
      if (item.value == this.defaultCode) {
        // console.log(item.value,index)
        this.countryCodePicker.defaultIndex = [index]
      }
    })
    // console.log(this.countryCodePicker.defaultIndex)
    this.countryCodePicker.columns = [countryCodes]
  },
  computed: {},
  methods: {
    countryCodeConfirm(e) {
      let result = {}
      // console.log(e)
      if (e) {
        result.countryCode = e.value[0].value
        result.countryCodeDesc = e.value[0].label
        result.phoneRegex = e.value[0].regex
        this.countryCodePicker.defaultIndex = e.indexs
      }
      this.$emit('pickConfirm', result)
    },

  },
  watch: {
    // show: {
    // 	deep: true,
    // 	immediate: true,
    // 	handler(newValue) {
    // 		if (!newValue) {
    // 			return
    // 		}
    // 	}
    // }
  }
}
</script>

<style lang="scss" scoped>
</style>
