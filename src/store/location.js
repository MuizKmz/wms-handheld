import {defineStore} from 'pinia'

export const useLocationStore = defineStore('location', {
    // 状态
    state: () => ({
        // 纬度
        latitude: 0,
        // 经度
        longitude: 0,
    }),
    // 方法
    actions: {
        /**
         * 获取位置信息
         */
        getLocationAction() {
            return new Promise(async (resolve, reject) => {
                uni.getLocation({
                    type: 'wgs84',
                    isHighAccuracy: true,
                    success: function(res) {
                        this.latitude = res.latitude
                        this.longitude = res.longitude
                        // commit('SET_LATITUDE', res.latitude)
                        // commit('SET_LONGITUDE', res.longitude)
                        console.log('当前位置的经度：' + res.longitude)
                        console.log('当前位置的纬度：' + res.latitude)
                        resolve({
                            latitude: res.latitude,
                            longitude: res.longitude
                        })
                    },
                    fail: function(err) {
                        console.log(err)
                        reject(err)
                    }
                })

                // #ifdef H5
                //获取定位经纬度
                // if (wechat.isWechat()) {
                // 	let res = await wechat.location()
                // 	commit('SET_LATITUDE', res.latitude)
                // 	commit('SET_LONGITUDE', res.longitude)
                // 	resolve()
                // }
                // #endif
                //#ifdef MP-WEIXIN
                // uni.authorize({
                //     scope: 'scope.userLocation',
                //     success: () => {
                //         uni.getLocation({
                //             type: 'wgs84', //  wgs84: 返回GPS坐标，gcj02: 返回国测局坐标
                //             success: res => {
                //                 commit('SET_LATITUDE', res.latitude)
                //                 commit('SET_LONGITUDE', res.longitude)
                //                 resolve()
                //             }
                //         })
                //     }
                // })
                //#endif
            })
        },
    },
    // 计算属性
    getters: {
        /**
         * 位置信息
         */
        info(state) {
            return {
                latitude: state.latitude,
                longitude: state.longitude
            }
        }
    },
})
