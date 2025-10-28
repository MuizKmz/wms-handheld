<template>
  <view class="warehouse-location-wrapper">
    <view class="location-row">
      <view class="form-item location-item" @click="onWarehouse">
        <text class="label">Warehouse:</text>
        <up-input v-model="displayWarehouse" border="none" class="input-field" clearable
                  placeholder=" Select" readonly>
          <template #suffix>
            <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
          </template>
        </up-input>
      </view>
      <view class="form-item location-item" @click="onWarehouse">
        <text class="label">Rack:</text>
        <up-input v-model="displayRack" border="none" class="input-field" clearable placeholder=" Select"
                  readonly>
          <template #suffix>
            <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
          </template>
        </up-input>
      </view>
    </view>
    <view class="form-item" @click="onWarehouse">
      <text class="label">Section:</text>
      <up-input v-model="displaySection" border="none" class="input-field"
                placeholder=" Select" readonly>
        <template #suffix>
          <up-icon :bold="true" class="input-right-icon" name="arrow-right" size="18"></up-icon>
        </template>
      </up-input>
    </view>
  </view>
  <u-picker v-if="ctrl.pickerShow" ref="uPicker" :cancelText="'Cancel'" :closeOnClickOverlay="true"
            :columns="ctrl.pickerOptions" :confirmText="'Confirm'"
            :defaultIndex="ctrl.pickerDefaultIndex" :immediateChange="true"
            :show="ctrl.pickerShow" :title="ctrl.pickerTitle" :visibleItemCount="7"
            keyName="label"
            @cancel="pickerConfirm" @change="pickerChange" @close="pickerConfirm" @confirm="pickerConfirm"></u-picker>
</template>
<script>
import {mapWritableState} from 'pinia'
import {useReceivingStore} from '@/store/receiving'

export default {
  props: {},
  data() {
    return {
      columns: [],
      list: [],
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
      scannedTags: 'scannedTags',
      receivingProducts: 'receivingProducts'
    }),
    displayWarehouse() {
      return this.receivingForm.warehouseCode || ''
    },
    displayRack() {
      return this.receivingForm.rackCode || ''
    },
    displaySection() {
      return this.receivingForm.sectionCode || ''
    }
  },
  mounted() {
    console.log('register-event-onShow')
    uni.$on('onShow', () => {
      this.getWarehouseList()
    })
  },
  beforeUnmount() {
    console.log('unRegister-event-onShow')
    uni.$off('onShow')
  },
  methods: {
    async onWarehouse() {
      await this.getWarehouseList()
      this.ctrl.pickerOptions = [...this.columns]
      this.ctrl.pickerDefaultIndex = [...this.defaultIndex]
      this.ctrl.pickerTitle = 'Warehouse-Rack-Section'
      this.ctrl.pickerShow = true
    },
    pickerChange(e) {
      const {
        columnIndex,
        value,
        picker = this.$refs.uPicker
      } = e
      let currentWarehouseCode = value[0].value
      let currentRackCode = columnIndex === 0 ? '' : value[1].value
      let currentSectionCode = columnIndex <= 1 ? '' : value[2].value
      let columns = this.getColumns(currentWarehouseCode, currentRackCode, currentSectionCode)

      if (columnIndex === 0) {
        // Warehouse changed - update rack and section lists
        picker.setColumnValues(1, columns[1])
        picker.setColumnValues(2, columns[2])
      } else if (columnIndex === 1) {
        // Rack changed - update section list
        picker.setColumnValues(2, columns[2])
      }
    },
    /**
     * Get warehouse, rack, section code list
     * @param warehouseCode
     * @param rackCode
     * @param sectionCode
     * @returns {Array}
     */
    getColumns(warehouseCode, rackCode, sectionCode) {
      let warehouseCodeList = [this.defaultOption]
      let rackCodeList = [this.defaultOption]
      let sectionCodeList = [this.defaultOption]

      if (!this.list || this.list.length <= 0) {
        return [warehouseCodeList, rackCodeList, sectionCodeList]
      }

      // Column 0 - Warehouse
      warehouseCodeList = this.list.map((warehouse) => {
        return {
          id: warehouse.id,
          label: warehouse.name,
          value: warehouse.code,
        }
      })

      // Column 1 - Rack
      let rackList = []
      if (!warehouseCode) {
        warehouseCode = warehouseCodeList[0].value
      }
      this.list.forEach((warehouse) => {
        if (warehouse.code === warehouseCode) {
          rackList = warehouse.racks || []
        }
      })
      if (rackList.length > 0) {
        rackCodeList = rackList.map((rack) => {
          return {
            id: rack.id,
            label: rack.name,
            value: rack.code,
            sections: rack.sections || []
          }
        })
      }

      // Column 2 - Section
      let sectionList = []
      if (!rackCode) {
        rackCode = rackCodeList[0].value
      }
      rackList.forEach((rack) => {
        if (rack.code === rackCode) {
          sectionList = rack.sections || []
        }
      })
      if (sectionList.length > 0) {
        sectionCodeList = sectionList.map((section) => {
          return {
            id: section.id,
            label: section.name,
            value: section.code
          }
        })
      }

      return [warehouseCodeList, rackCodeList, sectionCodeList]
    },
    pickerConfirm(e) {
      if (e) {
        console.log(e)
        this.defaultIndex = e.indexs
        this.receivingForm.warehouseId = e.value[0].id
        this.receivingForm.warehouseCode = e.value[0].value
        this.receivingForm.rackId = e.value[1].id
        this.receivingForm.rackCode = e.value[1].value
        this.receivingForm.sectionId = e.value[2] ? e.value[2].id : ''
        this.receivingForm.sectionCode = e.value[2] ? e.value[2].value : ''
      }
      this.ctrl.pickerShow = false
    },
    async getWarehouseList() {
      let res = await this.$api.getWarehouseCodeNameList()
      if (res.success) {
        this.list = res.data
        this.columns = this.getColumns(this.receivingForm.warehouseCode, this.receivingForm.rackCode, this.receivingForm.sectionCode)
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.warehouse-location-wrapper {
  width: 100%;
  margin-bottom: 8px;

  .location-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;

    .location-item {
      flex: 1;
      margin-bottom: 0 !important;
    }
  }

  .form-item {
    margin-bottom: 4px;
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

      :deep(.input-right-icon) {
        .u-icon__icon {
          font-size: 12px !important;
        }

        margin-right: 4px !important;
      }
    }
  }
}

:deep(.u-input__content__field-wrapper__field) {
  font-size: 13px !important;
  margin-left: 6px !important;
}

:deep(.u-toolbar__title) {
  padding: 0px !important;
}
</style>
  