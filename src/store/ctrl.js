import {defineStore} from 'pinia'

export const useCtrlStore = defineStore('ctrl', {
    // 状态
    state: () => ({
        tabbarIndex: 0,
        isLoading: false,
        prePageUrl: ''
    }),
    // 方法
    actions: {
        setTabbarIndexAction(index) {
            this.tabbarIndex = index
        }
    },
    // 计算属性
    getters: {},
})
