import * as config from '@/config'

export default {
    install(app) {
        Object.keys(config).forEach(key => {
            // 添加全局方法
            app.config.globalProperties['$' + key] = config[key]
        })
    }
}
