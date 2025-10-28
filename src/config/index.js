// default → development
console.log(import.meta.env.MODE)

// 接口地址
let API_BASE_URL = process.env.VITE_API_BASE_URL
// 图片地址
let IMG_BASE_URL = process.env.VITE_IMG_BASE_URL

let APP_URL = process.env.VITE_APP_URL

let WSS_BASE_URL = process.env.VITE_WSS_BASE_URL

let APP_KEY = 'wms-handheld'
// 版本号
const VERSION_CODE = '125.05.14'
// 默认语言
const DEFAULT_LOCALE_CODE = 'en'
export {
    API_BASE_URL,
    WSS_BASE_URL,
    IMG_BASE_URL,
    APP_KEY,
    VERSION_CODE,
    APP_URL,
    DEFAULT_LOCALE_CODE
}