<template>
  <view class="wms-self-stretch divider">
    <up-line :dashed="dashed" :hairline="false" color="#169c89"></up-line>
  </view>
</template>

<script>

export default {
  name: 'wms-divider',
  props: {
    dashed: {
      type: Boolean,
      default: true
    }
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.divider {
  margin-left: 10px;
  margin-right: 10px;
  //color: #169c89;
  //background-color: #169c89;
  //height: 1px;
}
</style>
