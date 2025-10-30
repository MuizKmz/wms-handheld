import {IMG_BASE_URL} from '@/config'
import storage from '@/utils/util.storage'
import business from '@/utils/kit/business'
import permission from '@/utils/kit/permission'
import countryCodeAndPhoneCodes from '@/locale/countryCodeAndPhoneCode.json'
import JSEncrypt from '@/utils/libs/jsencrypt'
import {route} from 'uview-plus'
import Compressor from 'compressorjs'

// Helper function to combine URL paths (replaces JabbokUtils.convert.urlPathCombine)
const urlPathCombine = (base, path) => {
    if (!path) return ''
    const cleanBase = base.replace(/\/$/, '')
    const cleanPath = path.replace(/^\//, '')
    return `${cleanBase}/${cleanPath}`
}

// Helper function to convert object to URL params
const urlParams = (obj) => {
    if (!obj || typeof obj !== 'object') return ''
    return Object.keys(obj)
        .filter(key => obj[key] !== undefined && obj[key] !== null)
        .map(key => {
            const value = obj[key]
            if (Array.isArray(value)) {
                // Handle arrays: tagCodes=val1&tagCodes=val2
                return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&')
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        })
        .join('&')
}

/**
 * 获取OSS图片
 */
const getOssImg = (imgPath) => {
    if (imgPath) {
        return urlPathCombine(IMG_BASE_URL, imgPath)
    } else {
        return ''
    }
}

/**
 * 国家编码转化
 */
const countryCodes = () => {
    let countryCodes = []
    for (let countryCode of countryCodeAndPhoneCodes) {
        // console.log(countryCode)
        countryCodes.push({
            label: `${countryCode.english_name}(+${countryCode.phone_code})`,
            value: countryCode.phone_code
        })
    }
    return countryCodes
}

/**
 * 根据编码获取描述
 */
const getCountryDescByCode = (code) => {
    for (let countryCode of countryCodeAndPhoneCodes) {
        if (countryCode.phone_code === code) {
            return `${countryCode.english_name}(+${countryCode.phone_code})`
        }
    }
    return ''
}

const genVCode = () => {
    let pubKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDHN3Tt3jKz8Oe3EynGZKgC3OwFVJ6ols7mOE46hb2ccpJfOTeIw0qsw4KnZTh/dEi220210X0s4bl7bVa9N24d3SBspkEeH5z4s9Bh+vcZzf0ZJlBmzVtYqYpcGuULhyaa0oXg2l3KJGUVJgwYVQuqiYMeYVL62OAAm4GtrT6S9QIDAQAB'
    let jsEncrypt = new JSEncrypt()
    jsEncrypt.setPublicKey(pubKey)
    return btoa(jsEncrypt.encrypt(new Date().getTime() + ''))
}

/**
 *  css部分使用了App.vue下的全局样式和iconfont图标，有需要图标库的可以留言。
 *  示例使用了uni.scss下的变量, 除变量外已尽量移除特有语法,可直接替换为其他预处理器使用
 */
const msg = (title, position = 'center', duration = 2500, mask = false, icon = 'none') => {
    // 统一提示方便全局修改
    if (Boolean(title) === false) {
        return
    }
    
    // Calculate duration based on message length for better readability
    const calculatedDuration = Math.max(2500, Math.min(title.length * 80, 5000))
    
    uni.showToast({
        position,
        title,
        duration: calculatedDuration,
        mask,
        icon
    })
}

const defStr = (val, defVal = '--') => {
    if (val) {
        return val
    }
    return defVal
}

const navigateBack = (params) => {
    const pages = getCurrentPages()
    if (pages.length === 1) {
        if (typeof params === 'number') {
            history.go(-params)
        } else {
            history.back()
        }
    } else {
        uni.navigateBack()
    }
}

const up = {
    route
}

/**
 *
 * @param fileObj 文件对象
 * @param quality 压缩质量
 * @returns {Promise<unknown>}
 */
const transFileData = async (fileObj, quality = 0.8) => {
    console.log(fileObj)
    console.log('处理前大小：' + fileObj.tempFiles[0].size / 1024 + ' KB')
    // #ifdef APP-PLUS
    return new Promise(async (resolve, reject) => {
        uni.showLoading({
            title: '正在处理图片'
        })
        // const file = fileObj.tempFiles[0]
        // 2. 压缩图片
        const compressedPath = await new Promise((resolve, reject) => {
            uni.compressImage({
                src: fileObj.tempFilePaths[0],
                quality: quality * 100,
                success: (res) => resolve(res.tempFilePath),
                fail: (err) => reject(new Error('压缩图片失败: ' + JSON.stringify(
                    err)))
            })
        })

        // 3. 读取压缩后的图片为 arrayBuffer
        const arrayBuffer = await new Promise((resolve, reject) => {
            try {
                plus.io.resolveLocalFileSystemURL(
                    compressedPath,
                    function(entry) {
                        entry.file(function(file) {
                            const fileReader = new plus.io.FileReader()
                            /*
                              2023.5 更新此处注释：
                              如果是Android10+，且用户选择的是原图(原始文件路径)，可能无法使用readAsDataURL读取，会导致一直等待。
                              暂时没有什么好的办法，具体参考：https://ask.dcloud.net.cn/article/36199
                            */
                            fileReader.readAsDataURL(file, 'utf-8')
                            fileReader.onloadend = function(evt) {
                                const result = {
                                    base64: evt.target.result
                                        .split(',')[1],
                                    size: file.size,
                                }
                                resolve(uni.base64ToArrayBuffer(result
                                    .base64))
                            }
                        })
                    },
                    function(error) {
                        reject(error)
                    },
                )
            } catch (error) {
                reject(error)
            } finally {
                uni.hideLoading()
            }
        })
        console.log('处理后大小：' + arrayBuffer.byteLength / 1024 + ' KB')
        resolve(arrayBuffer)
        //     uni.compressImage({
        //       src: fileObj.tempFilePaths[0],
        //       quality: quality * 100, // 1-100,数值越小,质量越低
        //       success: res => {
        //         uni.hideLoading()
        //         // resolve(res.tempFilePath)
        //         plus.io.resolveLocalFileSystemURL(res.tempFilePath, (entry) => {
        //           entry.file((file) => {
        //             const reader = new plus.io.FileReader()
        //             // reader.onload = (e) => resolve(e.target.result)
        // reader.onload = (event) => {
        //   const arrayBuffer = event.target.result
        //   console.log(arrayBuffer) // Access the ArrayBuffer here
        // }

        //             reader.onerror = reject
        //             reader.readAsArrayBuffer(file)
        // console.log(123)
        //           })
        //         })
        //       },
        //       fail: err => {
        //         uni.hideLoading()
        //         console.error('compressImage fail', err)
        //         reject(err)
        //       }
        //     })
    })
    // #endif

    // // #ifdef MP-WEIXIN
    // // eslint-disable-next-line no-unreachable
    // return uni.getFileSystemManager().readFileSync(file.path)
    // // #endif

    // #ifdef H5
    // const file = fileObj.tempFiles[0]
    // eslint-disable-next-line no-unreachable
    return new Promise((resolve, reject) => {
        new Compressor(fileObj.tempFiles[0], {
            quality: quality, // 输出质量 0-1
            maxWidth: 1920, // 最大宽度
            success(result) {
                uni.hideLoading()
                // 处理压缩后的文件 blob
                console.log('处理后大小：' + result.size / 1024 + ' KB')
                const fileReader = new FileReader()
                fileReader.onload = (e) => resolve(e.target.result)
                fileReader.onerror = reject
                // fileReader.onload = (event) => {
                //   const arrayBuffer = event.target.result
                //   console.log(arrayBuffer) // Access the ArrayBuffer here
                // }
                fileReader.readAsArrayBuffer(result)
            },
            error(err) {
                uni.hideLoading()
                console.error('compressImage fail', err)
                reject(err)
            }
        })
    })
    // #endif
}

// 获取文件扩展名
const getFileExtension = (path) => {
    const index = path.lastIndexOf('.')
    return index > -1 ? path.substring(index) : ''
}

// 根据文件类型设置 Content-Type
const getContentType = (file) => {
    const ext = getFileExtension(file.path).toLowerCase()
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime'
    }
    return contentTypes[ext] || file.type || 'application/octet-stream'
}

const deepClone = (obj) => {
    const isObject = args => (typeof args === 'object' || typeof args === 'function') && typeof args !== null
    if (!isObject) throw new Error('Not Reference Types')
    let newObj = Array.isArray(obj) ? [...obj] : {...obj}
    Reflect.ownKeys(newObj).map(key => {
        newObj[key] = isObject(obj[key]) ? deepClone(obj[key]) : obj[key]
    })
    return newObj
}

let current = {
    getOssImg,
    countryCodes,
    getCountryDescByCode,
    genVCode,
    msg,
    defStr,
    navigateBack,
    up,
    transFileData,
    getContentType,
    deepClone,
    convert: {
        urlParams,
        urlPathCombine
    },
    ...storage,
    ...business,
    ...permission
}
export default current