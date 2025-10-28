<template>
  <view class="form-item">
    <text class="label">{{ title }}:</text>
    <up-input v-model="stockReturnForm.keyword" border="none" class="input-field"
              placeholder="Tag Code / Product Name / SKU Code">
      <template #suffix>
        <up-button
            icon="search"
            shape="square"
            size="mini"
            text="Search"
            type="primary"
            @click="getSearchTags"
        ></up-button>
      </template>
    </up-input>
  </view>
</template>
<script>
import {mapActions, mapWritableState} from 'pinia'
import {useStockStore} from '@/store/stock'

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
    'stockReturnForm.keyword': {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.getSearchTags()
      }
    }
  },
  data() {
    return {
      code: '',
    }
  },
  computed: {
    ...mapWritableState(useStockStore, {
      stockReturnForm: 'stockReturnForm',
      scannedTags: 'scannedTags',
    }),
    title() {
      return 'Search'
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
    ...mapActions(useStockStore, {getSearchTags: 'getSearchReturnTagsAction'}),

    resetForm() {
    }
  }
}
</script>
<style lang="scss" scoped>
.form-item {
  margin-bottom: 4px;

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
</style>
  