import {defineStore} from 'pinia'
import api from '@/api'

export const useCommonStore = defineStore('common', {
    // 状态
    state: () => ({
        config: {
            debug: false,
            loginUsername: false,
            loginPhone: false,
            smsMock: true,
            emergencyCall: ''
        },
    }),
    // 方法
    actions: {
        /**
         * 获取配置
         */
        async getConfigAction() {
            let res = await api.getConfig(1)
            if (res.success) {
                let config = {}
                res.data.forEach(item => {
                    if (item.code === 'debug') {
                        config.debug = item.value === '1'
                    }
                    if (item.code === 'login-username') {
                        config.loginUsername = item.value === '1'
                    }
                    if (item.code === 'login-phone') {
                        config.loginPhone = item.value === '1'
                    }
                    if (item.code === 'sms-mock') {
                        config.smsMock = item.value === '1'
                    }
                    if (item.code === 'emergency-call') {
                        config.emergencyCall = item.value
                    }
                })
                // console.log(config)
                this.config = config
            }
        },
    },
    // 计算属性
    getters: {
        /**
         * 当前站点
         */
        // config(state) {
        //     return state.config
        // }
    },
})
