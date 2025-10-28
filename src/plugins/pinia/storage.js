// piniaLocalStoragePlugin.js
import storage from '@/utils/util.storage'

import {watch} from 'vue'

/**
 * 插件会自动将Pinia store的状态保存到本地存储。
 * 在页面刷新时,插件会从本地存储中恢复状态。
 * 您可以配置要保存的特定路径,而不是整个状态。
 * @param options
 * @returns {(function(*): void)|*}
 */
export function createLocalStoragePlugin(options = {}) {
    const {
        key = 'pinia',
        // storage = localStorage,
        paths = null,
        overwrite = false,
    } = options

    return function(context) {
        const {store} = context
        // 从本地存储恢复状态
        const fromStorage = storage.getCache(key)
        if (fromStorage) {
            // const savedState = JSON.parse(fromStorage)
            if (overwrite) {
                store.$patch(fromStorage[store.$id])
            } else {
                store.$patch(state => {
                    Object.assign(state, fromStorage[store.$id])
                })
            }
        }

        // 监听状态变化并保存到本地存储
        watch(
            () => store.$state,
            (state) => {
                let toStore
                if (paths) {
                    // console.log(paths)
                    toStore = paths.reduce((partialState, path) => {
                        const pathParts = path.split('.')
                        let value = state
                        for (const part of pathParts) {
                            value = value[part]
                        }
                        pathParts.reduce((obj, key, index) => {
                            if (index === pathParts.length - 1) {
                                obj[key] = value
                            } else {
                                obj[key] = obj[key] || {}
                            }
                            return obj[key]
                        }, partialState)
                        return partialState
                    }, {})
                } else {
                    toStore = state
                }

                let fromStorage = storage.getCache(key)
                if (!fromStorage) {
                    fromStorage = {}
                }
                fromStorage[store.$id] = toStore
                storage.putCache(key, fromStorage)
            },
            {deep: true}
        )
    }
}