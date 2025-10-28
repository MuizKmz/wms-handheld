import {defineStore} from 'pinia'
import DeviceManager from '@/utils/kit/device'

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        deviceManager: new DeviceManager(),
        deviceInfo: {},
        deviceInventoryList: [],
        inventoryInProgress: false,
        searchInProgress: false,
    }),
    actions: {
        /**
         * Register device
         */
        registerDeviceAction() {
            return this.device.register('xxx-xxx-xxx-xxx-xxx')
        },

        /**
         * Initialize device
         */
        initDeviceAction() {
            return this.deviceManager.init()
        },

        /**
         * Start inventory
         */
        startInventoryAction(searchEPC) {
            this.inventoryInProgress = true
            this.deviceManager.device.startInventory({readInterval: 100, searchEPC: searchEPC}, res => {
                if (res.success) {
                    this.deviceInventoryList = res.data
                } else {
                    this.inventoryInProgress = false
                }
            })
        },

        /**
         * Stop inventory
         */
        stopInventoryAction() {
            this.inventoryInProgress = false
            return this.deviceManager.stopInventory()
        },

        /**
         * Stop inventory
         */
        async getDeviceInfoAction() {
            let res = await this.deviceManager.deviceInfo()
            if (res.success) {
                this.deviceInfo = res.data
            }
        },
    },
    // 计算属性
    getters: {},
})
