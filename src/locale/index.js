import {createI18n} from 'vue-i18n'
import utils from '@/utils/util.storage'
import {DEFAULT_LOCALE_CODE} from '@/config'
import en from '@/locale/en.json'
import msMY from '@/locale/ms-MY.json'
import zhHans from '@/locale/zh-Hans.json'


// 构造i18n对象
const i18n = new createI18n({
    // 默认语言，这里的local属性，对应message中的zh、en属性
    locale: utils.getCache('LOCALE_CODE', DEFAULT_LOCALE_CODE),
    legacy: true, // 如果要支持compositionAPI，此项必须设置为false;
    globalInjection: true, // 全局注册$t方法
    // 引入语言文件
    messages: {
        // 这里的属性名是任意的，您也可以把zh设置为cn等，只是后续切换语言时
        // 要标识这里的语言属性，如：this.$i18n.locale = zh|en|zh|xxx
        'en': en,
        'ms-MY': msMY,
        'zh-Hans': zhHans,
    }
})
export default i18n
