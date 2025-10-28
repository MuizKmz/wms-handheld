<template>
  <view class="page-box wms-flex-col wms-items-center wms-justify-center">
    <view class="centre">
      <image :src="image" mode="aspectFit"></image>
      <view v-if="content" class="tips">
        {{ content }}
      </view>
    </view>
    <view class="wms-flex-row wms-justify-center ctrl-wrapper">
      <view class="ctrl-content">
        <up-button v-if="btn" :icon="btn.icon" :text="btn.title" type="primary" @click="onTap"></up-button>
      </view>
    </view>
  </view>
</template>

<script>
import defaultImg from '@/static/images/undraw/empty_cart.png'

export default {
  props: {
    content: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: defaultImg
    },
    btn: {
      type: Object,
      default: null
    }
  },
  methods: {
    onTap() {
      this.$emit('onTap')
    }
  }
}
</script>

<style lang="scss" scoped>
.page-box {
  // position: relative;
  // left: 0;
  // top:0;
  height: 70vh;
}

.centre {
  // position: absolute;
  // left: 0;
  // top: 0;
  // right: 0;
  // bottom: 0;
  // margin: auto;
  // height: 0rpx;
  text-align: center;
  // padding: 200rpx auto;
  font-size: 20px;

  image {
    // width: 387rpx;
    // height: 341rpx;
    width: 240px;
    // height: 270rpx;
    // margin-bottom: 20rpx;
    margin: 0 auto 20rpx;
    // border: 1px dotted #000000;
  }

  .tips {
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 26px;
    text-align: center;

    color: #010101;
  }
}

.ctrl-wrapper {
  //padding: 0 5px;
  position: fixed;
  bottom: 70px;
  width: 100vw;

  .ctrl-content {
    width: 200rpx;

    :deep(.u-button--primary) {
      border-radius: 10px;
      font-size: 17px;
      font-family: Nunito;
      line-height: 11px;
      font-weight: 500;
      color: #ffffff;
    }

    :deep(.u-button--warning) {
      border-radius: 10px;
      font-size: 17px;
      font-family: Nunito;
      line-height: 11px;
      font-weight: 500;
      color: #ffffff;
    }
  }
}
</style>
