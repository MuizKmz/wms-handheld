<script>
import {mapActions, mapState} from 'pinia'
import {useUserStore} from './store/user'
import {useCommonStore} from './store/common'
import {useLocationStore} from './store/location'
import {WSS_BASE_URL} from './config'
import WebSocketManager from './utils/kit/websocket.js'

export default {
  async onLaunch() {
    console.log('App Launch')
    
    // Override uni.showToast to show longer duration for error messages
    const originalShowToast = uni.showToast
    uni.showToast = function(options) {
      if (options && options.title) {
        // Calculate duration based on message length
        const minDuration = 2500
        const maxDuration = 5000
        const calculatedDuration = Math.max(minDuration, Math.min(options.title.length * 80, maxDuration))
        
        options.duration = options.duration || calculatedDuration
      }
      return originalShowToast.call(this, options)
    }
    
    this.init()
  },
  data() {
    return {
      ctrl: {
        connected: false,
        connecting: false
      }
    }
  },
  async onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  },
  computed: {
    ...mapState(useUserStore, {token: 'token', userInfo: 'info'}),
  },
  methods: {
    ...mapActions(useCommonStore, ['getConfigAction']),
    ...mapActions(useLocationStore, ['getLocationAction']),
    ...mapActions(useUserStore, ['getUserInfoAction']),
    // ...mapActions(useActivityStore, ['initRedPacketAction']),
    async init() {
      // #ifdef APP-PLUS
      // this.getAppInfo()
      // #endif

      // 获取定位信息
      // try {
      //   await this.getLocationAction()
      // } catch (e) {
      //   console.log('获取定位信息失败', e)
      // }
      // 获取配置信息
      // this.getConfigAction()
      if (this.token) {
        this.getUserInfoAction()
        // 建立消息通知连接
        // this.initWebsocket()
      }
    },
    async getAppInfo() {
      plus.runtime.getProperty(plus.runtime.appid, async (widgetInfo) => {
        let currentVersionCode = plus.runtime.versionCode
        // console.log(currentVersionCode)
        let res = await this.$api.getDicList('APP_INFO')
        if (res.success) {
          // console.log(res)
          if (res.data && res.data.length > 0) {
            let appInfo = JSON.parse(res.data[0].extraData)
            // console.log(appInfo.customer)
            let appUpdate = appInfo.customer[uni.getSystemInfoSync().platform]
            if (appUpdate.open) {
              console.log(currentVersionCode)
              if (currentVersionCode < appUpdate.versionCode) {
                uni.showModal({
                  title: '更新提醒',
                  content: '发现新版本，是否前往更新？',
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      plus.runtime.openURL(appUpdate.marketUrl, function(res) {
                        console.log(res)
                      })
                    }
                  }
                })
              } else {
                console.log('已经是最新版本')
              }
            }
          }
        }
      })
    },
    /**
     * 建立连接
     */
    initWebsocket() {
      const wsManager = new WebSocketManager(this.$convert.urlPathCombine(WSS_BASE_URL, `/notify/${this.token}`), {
        maxReconnectAttempts: 5,
        reconnectInterval: 3000,
        heartbeatInterval: 30000
      })

      wsManager.connect()

      wsManager.onMessage(async (data) => {
        // console.log('收到消息:', data)
        let msg = JSON.parse(data)
        // 消息通知
        if (msg.type === 1) {
          // #ifdef APP-PLUS
          // 请求通知权限
          // await Notification.requestPermission()
          console.log(msg.data)
          // 创建一个简单通知
          // await Notification.create({
          //   title: msg.data.title,
          //   content: msg.data.content,
          //   onClick: (message) => {
          //     console.log('用户点击了通知:', message)
          //   }
          // })
          // #endif
          // await this.getNotifyListAction()
        }
      })
    },
  }
}
</script>

<style lang="scss">
@import "uview-plus/index.scss";
@import "./static/styles/font.scss";
@import "./static/styles/codefun.scss";
@import "./static/styles/common.scss";

page {
  background-color: #f5f7fa;
}
</style>
<!--<script lang="ts" setup>-->
<!--</script>-->