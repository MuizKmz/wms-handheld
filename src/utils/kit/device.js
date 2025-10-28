export default class DeviceManager {
    constructor() {
        //#ifdef APP-PLUS
        this.device = uni.requireNativePlugin('uhf-device')
        //#endif
        // this.code = options.code || ''
    }

    register(code) {
        let promise = new Promise((resolve) => {
            this.device.register({
                code
            }, res => {
                resolve(res)
            })
        })
        return promise
    }

    init() {
        let promise = new Promise((resolve) => {
            this.device.init(res => {
                resolve(res)
            })
        })
        return promise
    }

    // startInventory() {
    //     let promise = new Promise((resolve) => {
    //         this.device.startInventory(res => {
    //             // console.log(res)
    //             resolve(res)
    //         })
    //     })
    //     return promise
    // }

    stopInventory() {
        let promise = new Promise((resolve) => {
            this.device.stopInventory(res => {
                resolve(res)
            })
        })
        return promise
    }

    deviceInfo() {
        let promise = new Promise((resolve) => {
            this.device.deviceInfo(res => {
                resolve(res)
            })
        })
        return promise
    }

    open() {
        let promise = new Promise((resolve) => {
            this.device.open(res => {
                resolve(res)
            })
        })
        return promise
    }

    close() {
        let promise = new Promise((resolve) => {
            this.device.close(res => {
                resolve(res)
            })
        })
        return promise
    }
}