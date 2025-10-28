<template>
  <!--  $t('uview.common.confirmText')-->
  <!--  $t('uview.common.cancelText')-->
  <!--  $t('common.page.country-code.picker-title')-->
  <u-picker :show="true" ref="uPicker" :title="'选择地区'"
            :confirmText="'确认'" :cancelText="'取消'"
            :columns="regionPicker.columns" :defaultIndex="regionPicker.defaultIndex"
            :visibleItemCount="7"
            :closeOnClickOverlay="true" :immediateChange="true" keyName="name"
            @confirm="regionConfirm" @cancel="regionConfirm" @close="regionConfirm" @change="onChange"></u-picker>
</template>

<script>
import smartArrayToTree from 'smart-arraytotree'

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
      regionPicker: {
        // showCountryCode: true,
        defaultIndex: [],
        columns: [],
      },
    }
  },
  async mounted() {
    this.getCityList()
    uni.$on('onShow', (data) => {
      this.getCityList()
    })

  },
  onShow() {
    this.getCityList()
  },
  beforeUnmount() {
    uni.$off('onShow')
  },
  computed: {},
  methods: {
    async getCityList() {
      // console.log(this.regionPicker.defaultIndex)
      let res = await this.$api.getCityList()
      let regions = []
      smartArrayToTree(res.data, {
        id: 'id',
        pid: 'parentId',
        children: 'children',
        firstPid: '0'
      }).forEach(item => {
        if (item.id === '132') {
          regions.push(item)
        }
      })

      // console.log(st)
      // regions.forEach((item, index) => {
      //   if (item.value == this.defaultCode) {
      //     // console.log(item.value,index)
      //     this.regionPicker.defaultIndex = [index]
      //   }
      // })
      // console.log(this.regionPicker.defaultIndex)
      // 第1列
      this.regionPicker.columns = [regions]
      // console.log(regions)
      this.$nextTick(() => {
        // 第2列
        this.$refs.uPicker.setColumnValues(1, regions[0]?.children)
        // 第3列
        this.$refs.uPicker.setColumnValues(2, regions[0]?.children[0]?.children)
      })
    },
    regionConfirm(e) {
      if (e) {
        this.regionPicker.defaultIndex = e.indexs
      }
      this.$emit('pickConfirm', e?.value)
    },

    onChange(e) {
      if (e.columnIndex === 0) {
        // 第2列
        this.$refs.uPicker.setColumnValues(1, e.value[0]?.children)
      }
      if (e.columnIndex === 1) {
        // 第3列
        this.$refs.uPicker.setColumnValues(2, e.value[1]?.children)
      }
    }
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
