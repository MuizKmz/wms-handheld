// noinspection ES6UnusedImports

import {API_BASE_URL} from '@/config'
import utils from '@/utils'
import {useUserStore} from '@/store/user'
import storage from '@/utils/util.storage'
// import i18n from "../locale";
// H5版本
// #ifdef H5
import Fly from 'flyio/dist/npm/fly'
// #endif
//微信小程序和APP版本
// #ifndef H5
import Fly from 'flyio/dist/npm/wx'

// console.log(i18n)
// #endif

const request = new Fly()

// 请求拦截处理
request.interceptors.request.use(async (request) => {
    const userStore = useUserStore()
    request.baseURL = API_BASE_URL
    request.headers['Authorization'] = userStore.token
    // request.headers["locale"] = utils.getCache("LOCALE_CODE")
    // 防止缓存
    if (request.method === 'POST' && request.headers['Content-Type'] !== 'multipart/form-data') {
        // request.body = {
        //   ...request.body
        // }
    } else if (request.method === 'GET') {
        request.params = {
            _t: Date.parse(new Date()) / 1000,
            ...request.params
        }
    }
    return request
})

// 响应拦截处理
request.interceptors.response.use(async (response) => {
    // Unified response adapter: legacy backend returned {code, data, msg, success?}
    // New NestJS backend returns plain objects (e.g. { token, user }) or arrays.
    const raw = response.data
    const userStore = useUserStore()

    // Handle legacy auth expiration
    if (raw && (raw.code === 401 || raw.status === 401)) {
        storage.clearCache()
        uni.reLaunch({url: '/views/public/login'})
        return {success: false, msg: 'Unauthorized'}
    }
    if (raw && raw.code === '9999') {
        userStore.logoutAction()
        return {success: false, msg: 'Session expired'}
    }

    // If already in unified shape (has explicit success flag) just pass through
    if (raw && Object.prototype.hasOwnProperty.call(raw, 'success')) {
        return raw
    }

    // Legacy shape with code
    if (raw && Object.prototype.hasOwnProperty.call(raw, 'code')) {
        const success = String(raw.code) === '200' || String(raw.code) === '0'
        return {
            success,
            code: raw.code,
            data: raw.data !== undefined ? raw.data : raw.result ?? null,
            msg: raw.msg || raw.message || (success ? 'OK' : 'Error')
        }
    }

    // New backend plain object: wrap
    return {success: true, data: raw}
}, function (err) {
    let message = 'Network error'
    if (err && err.response && err.response.status) {
        if (err.response.status === 401) {
            storage.clearCache()
            uni.reLaunch({url: '/views/public/login'})
            message = 'Unauthorized'
        } else if (err.response.data && err.response.data.message) {
            message = err.response.data.message
        }
    } else if (err && err.message) {
        message = err.message
    }
    uni.showToast({
        icon: 'none',
        title: message,
        duration: 2500
    })
    return {success: false, msg: message, data: null}
})

const httpRequest = (opts) => {
    let url = opts.url
    let method = opts.method
    let params = opts.params
    let data = opts.data
    if (params) {
        params = '?' + utils.convert.urlParams(params)
    } else {
        params = ''
    }

    let promise = new Promise((resolve, reject) => {
        request.request(url + params, data, {method: method}).then(function (response) {
            resolve(response)
        })
            .catch(function (error) {
                // console.log(error);
                reject(error)
            })
    })
    return promise
}

export {
    httpRequest
}
