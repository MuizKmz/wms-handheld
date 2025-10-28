<template>
  <!-- #ifdef APP-PLUS -->
  <view :style="`background-color: ${bgColor};`" class="status_bar">
    <view :style="`background-color: ${bgColor};`" class="top_view"></view>
  </view>
  <!-- #endif -->
</template>

<script>
export default {
  name: 'UniStatusBar',
  props: {
    bgColor: {
      type: String,
      default: '#f5e1c1'
    }
  },
  data() {
    return {
      // statusBarHeight: statusBarHeight
    }
  }
}
</script>

<style scoped>
.status_bar {
  height: var(--status-bar-height);
  width: 100%;
  /* background-color: #169C89; */
}

.top_view {
  height: var(--status-bar-height);
  width: 100%;
  position: fixed;
  /* background-color: #169C89; */
  top: 0;
  z-index: 999;
}
</style>