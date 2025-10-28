import consts from '@/consts'

export default {
    install(app) {
        Object.keys(consts).forEach(key => {
            // 添加全局方法
            app.config.globalProperties['$C_' + key] = consts[key]
        })
    }
}
