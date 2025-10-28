import {defineStore} from 'pinia'
import api from '@/api'
import storage from '@/utils/util.storage'
// import {USER_LOGIN_ROLE} from '@/config'

export const useUserStore = defineStore('user', {
    // 状态
    state: () => ({
        loginForm: {
            username: '',
        },
        // 用户信息
        info: {},
        // 登录TOKEN
        token: '',
    }),
    // 方法
    actions: {
        getUserInfoAction(payload) {
            return new Promise(async (resolve) => {
                let res = await api.getUserInfo(payload)
                // uni.test()
                if (res.success) {
                    this.info = res.data
                }
                resolve(res)
            })
        },
        loginAction(payload) {
            return new Promise(async (resolve) => {
                const res = await api.login(payload)
                if (res.success && res.data) {
                    // New backend returns { token, user }
                    const token = res.data.token || res.data.access_token
                    if (token) this.token = `Bearer ${token}`
                    this.info = res.data.user || res.data.info || {}
                }
                resolve(res)
            })
        },
        async logoutAction() {
            this.token = ''
            this.info = {}
            storage.clearCache()
            await api.logout()
            // ✅ Always navigate to login page instead of conditionally navigating back
            uni.reLaunch({
                url: '/views/public/login'
            })
        }
    },
    // 计算属性
    getters: {
        /**
         * 用户信息
         */
        userInfo(state) {
            return state.info
        },
        /**
         * 用户信息
         */
        // token(state) {
        //     return state.token
        // },
    },
})
