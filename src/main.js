import {createSSRApp} from 'vue'
import App from './App.vue'
import pinia from './store'
import uviewPlus from 'uview-plus'
import i18n from '@/locale'
import utilsPlugin from './plugins/utils'
import apiPlugin from './plugins/api'
import constsPlugin from './plugins/consts'
import configPlugin from './plugins/config'
// import 'uno.css'

export function createApp() {
    const app = createSSRApp(App)
    // Pinia configuration
    app.use(pinia)
    // 设置uview的配置
    app.use(uviewPlus)
    // 安装插件
    app.use(utilsPlugin)
    app.use(apiPlugin)
    app.use(constsPlugin)
    app.use(configPlugin)
    app.use(i18n)
    return {
        app,
    }
}
