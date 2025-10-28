import api from '@/api'

export default {
    install(app) {
        // 添加全局方法
        app.config.globalProperties['$api'] = api
    }
}
