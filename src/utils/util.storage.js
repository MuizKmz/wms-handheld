/**
 * 缓存数据优化
 * var cache = require('utils/cache.js');
 * import cache from '../cache'
 * 使用方法 【
 *     一、设置缓存
 *         string    cache.put('k', 'string你好啊');
 *         json      cache.put('k', { "b": "3" }, 2);
 *         array     cache.put('k', [1, 2, 3]);
 *         boolean   cache.put('k', true);
 *     二、读取缓存
 *         默认值    cache.get('k')
 *         string    cache.get('k', '你好')
 *         json      cache.get('k', { "a": "1" })
 *     三、移除/清理
 *         移除: cache.remove('k');
 *         清理：cache.clear();
 * 】
 * @type {String}
 */
var suffix = '_csStore' // 缓存前缀
/**
 * 设置缓存
 * @param  {[type]} k [键名]
 * @param  {[type]} v [键值]
 * @param  {[type]} t [时间、单位秒]
 */
const putCache = (k, v, t) => {
    uni.setStorageSync(k, v)
    var seconds = parseInt(t)
    if (seconds > 0) {
        var timestamp = Date.parse(new Date())
        timestamp = timestamp / 1000 + seconds
        uni.setStorageSync(k + suffix, timestamp + '')
    } else {
        uni.removeStorageSync(k + suffix)
    }
}


/**
 * 获取缓存
 * @param  {[type]} k   [键名]
 * @param  {[type]} def [获取为空时默认]
 */
const getCache = (k, def) => {
    var deadtime = parseInt(uni.getStorageSync(k + suffix))
    if (deadtime) {
        if (parseInt(deadtime) < Date.parse(new Date()) / 1000) {
            uni.removeStorageSync(k)
            uni.removeStorageSync(k + suffix)
            if (def) {
                return def
            } else {
                return false
            }
        }
    }
    var res = uni.getStorageSync(k)
    if (res) {
        return res
    } else {
        if (def == undefined || def == '') {
            def = false
        }
        return def
    }
}

const removeCache = (k) => {
    uni.removeStorageSync(k)
    uni.removeStorageSync(k + suffix)
}

/**
 * 清理所有缓存
 * @return {[type]} [description]
 */
const clearCache = () => {
    uni.clearStorageSync()
}


// module.exports = {
//     putCache: put,
//     getCache: get,
//     removeCache: remove,
//     clearCache: clear,
// }

export default {
    getCache,
    putCache,
    removeCache,
    clearCache
}