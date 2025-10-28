<template>
  <view class="wms-flex-row wms-justify-between wms-items-center tab-bar-wrapper mt-116">
    <view class="menu-wrapper">
      <view v-if="tabbarIndex === 0" class="wms-flex-row wms-items-center active-wrapper">
        <image class="wms-shrink-0 icon-active" src="@/static/images/home_empty.png"/>
        <text class="font_6 text_23 ml-9">首页</text>
      </view>
      <image v-else class="icon-inactive" src="@/static/images/home_fill.png" @click="toHome"/>
    </view>


    <!--    <view class="wms-flex-row wms-items-center active-wrapper" v-if="tabbarIndex === 1">-->
    <!--      <image class="wms-shrink-0 icon-active" src="@/static/images/fav_empty.png"/>-->
    <!--      <text class="font_6 text_23 ml-9">收藏</text>-->
    <!--    </view>-->
    <!--    <image v-else class="icon-inactive" src="@/static/images/fav_fill.png"/>-->

    <view v-if="cartShow" class="menu-wrapper">
      <view v-if="tabbarIndex === 2" class="wms-flex-row wms-items-center active-wrapper">
        <image class="wms-shrink-0 icon-active" src="@/static/images/cart_empty.png"/>
        <text class="font_6 text_23 ml-9">购物车</text>
      </view>
      <view v-else class="cart-wrapper">
        <up-badge v-if="!ctrl.isLoading&&goodsNum" :class="cardBadgeCssClass" :value="goodsNum" max="99"
                  type="primary"/>
        <image class="icon-inactive" src="@/static/images/cart_fill.png" @click="toCart"/>
      </view>
    </view>

    <view class="menu-wrapper">
      <view v-if="tabbarIndex === 3" class="wms-flex-row wms-items-center active-wrapper">
        <image class="wms-shrink-0 icon-active" src="@/static/images/mine_empty.png"/>
        <text class="font_6 text_23 ml-9">我的</text>
      </view>
      <image v-else class="icon-inactive" src="@/static/images/mine_fill.png" @click="toMine"/>
    </view>
  </view>
</template>

<script>
import {mapWritableState} from 'pinia'
import {useCtrlStore} from '@/store/ctrl'
import {useCartStore} from '@/store/cart'
import {useUserStore} from '@/store/user'
import {ROUTE_INDEX, USER_LOGIN_ROLE} from '@/config'

export default {
  name: 'wms-tab-bar',
  props: {
    // title: {
    //   type: String,
    //   default: ''
    // },
    // goodsList: {
    //   type: Array,
    //   default: () => []
    // }
  },
  components: {},
  data() {
    return {
      ctrl: {
        isLoading: true
      }
    }
  },
  computed: {
    ...mapWritableState(useCtrlStore, ['tabbarIndex']),
    ...mapWritableState(useCartStore, ['goodsNum']),
    ...mapWritableState(useUserStore, ['token']),
    cardBadgeCssClass() {
      return 'cart-badge-' + ((this.goodsNum + '').length - 1)
    },
    cartShow() {
      return USER_LOGIN_ROLE === 1
    }
  },
  mounted() {
    let that = this
    setTimeout(() => {
      that.ctrl.isLoading = false
    }, 500)
  },
  onLoad() {

  },
  methods: {
    toHome() {
      this.tabbarIndex = 0
      uni.redirectTo({
        url: ROUTE_INDEX
      })
    },
    toCart() {
      this.tabbarIndex = 2
      uni.redirectTo({
        url: '/views/cart'
      })
    },
    toMine() {
      this.tabbarIndex = 3
      if (this.token) {
        uni.redirectTo({
          url: '/views/mine/index'
        })
      } else {
        uni.redirectTo({
          url: '/views/public/login'
        })
      }
    }
  }
}
</script>

<style>
.mt-116 {
  margin-top: 116px;
}

.ml-9 {
  margin-left: 9px;
}

.tab-bar-wrapper {
  position: fixed;
  width: 100vw;
  padding: 15px 22px;
  background-color: #e8f3f2;
  bottom: 0;
  z-index: 99;

  .menu-wrapper {
    width: 94px;
    display: flex;
    flex-direction: row;
    justify-content: center;

    .active-wrapper {
      padding: 4px 8px 4px 12px;
      background-color: #169c89;
      border-radius: 6px;
      backdrop-filter: blur(5px);
      height: 36px;
      border-left: solid 1px #ffffff;
      border-right: solid 1px #ffffff;
      border-top: solid 1px #ffffff;
      border-bottom: solid 1px #ffffff;

      .icon-active {
        width: 20px;
        height: 20px;
      }

      .text_23 {
        color: #ffffff;
        line-height: 10px;
      }
    }

    .cart-wrapper {
      position: relative;

      .cart-badge-0 {
        position: absolute;
        top: -12px;
        right: -12px;
      }

      .cart-badge-1 {
        position: absolute;
        top: -10px;
        right: -20px;
      }

      .cart-badge-2 {
        position: absolute;
        top: -12px;
        right: -28px;
      }
    }

    .icon-inactive {
      width: 24px;
      height: 24px;
    }
  }
}
</style>