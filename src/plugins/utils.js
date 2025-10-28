import utils from '@/utils'

export default {
    install(app) {
        Object.keys(utils).forEach(key => {
            // 添加全局方法
            app.config.globalProperties['$' + key] = utils[key]
        })
    }
}
