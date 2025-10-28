<template>
  <up-navbar
      :autoBack="autoBack"
      :fixed="true"
      :leftIcon="leftIcon"
      :placeholder="true"
      :title="title"
      bgColor="#398ade"
      leftIconColor="#ffffff"
      rightIconColor="#ffffff"
      titleStyle="color:#ffffff"
      @leftClick="leftClick"
  >
    <template #left>
      <view
          v-if="showHome"
          class="u-nav-slot"
      >
        <up-icon
            name="arrow-left"
            size="19"
        ></up-icon>
        <up-line
            :hairline="false"
            direction="column"
            length="16"
            margin="0 8px"
        ></up-line>
        <up-icon name="home"
                 size="20"
                 @click="toHome"
        ></up-icon>
      </view>
      <slot v-else name="left"></slot>
    </template>
    <template #right>
      <slot v-if="!showCart" name="right"></slot>
      <view v-if="showCart" class="wms-flex-row">
        <!--          <up-tag :text="''" shape="circle" @click="toMerchant"></up-tag>-->
        <up-icon color="#169c89" name="shopping-cart-fill" size="32" @click="toCart"></up-icon>
      </view>
    </template>
  </up-navbar>
</template>

<script>
// import {mapWritableState} from 'pinia'
// import {useCtrlStore} from '@/store/ctrl'

export default {
  name: 'wms-tab-bar',
  props: {
    title: {
      type: String,
      default: ''
    },
    autoBack: {
      type: Boolean,
      default: false
    },
    leftIcon: {
      type: String,
      default: 'arrow-left'
    },
    showHome: {
      type: Boolean,
      default: false
    },
    showRight: {
      type: Boolean,
      default: false
    },
    rightIcon: {
      type: String,
      default: ''
    },
    rightText: {
      type: String,
      default: ''
    },
    showCart: {
      type: Boolean,
      default: false
    }
    // goodsList: {
    //   type: Array,
    //   default: () => []
    // }
  },
  components: {},
  data() {
    return {}
  },
  computed: {
    // ...mapWritableState(useCtrlStore, ['tabbarIndex'])
  },
  mounted() {
  },
  onLoad() {
  },
  // onBackPress(options) {
  //   console.log('from:' + options.from)
  // },
  methods: {
    leftClick() {
      console.log('leftClick', this.autoBack)
      if (this.autoBack) {
        return
      }
      this.toBack()
      // this.$emit('on-back')
    },
    toBack() {
      console.log('toBack')
      // uni.navigateBack()
      this.$navigateBack()
    },
    toHome() {
      uni.redirectTo({
        url: '/views/index'
      })
    },
    toCart() {
      uni.navigateTo({
        url: '/views/cart'
      })
    }
  }
}
</script>

<style>
.u-nav-slot {
  padding: 6px;
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  border-radius: 16px;
}

:deep(.u-navbar__content__title) {
  color: #169C89;

  font-family: Nunito;
  font-size: 18px !important;
  font-style: normal;
  font-weight: 600;
  line-height: 140%; /* 28px */
  letter-spacing: 0.2px;
}

:deep(.u-navbar__content) {
  height: 44px !important;
}
</style>