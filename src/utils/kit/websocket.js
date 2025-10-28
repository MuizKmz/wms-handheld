export default class WebSocketManager {
    constructor(url, options = {}) {
        this.url = url
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5
        this.reconnectInterval = options.reconnectInterval || 3000
        this.heartbeatInterval = options.heartbeatInterval || 30000
        this.reconnectCount = 0
        this.ws = null
        this.heartbeatTimer = null
        this.reconnectTimer = null
        this.messageCallbacks = []
        this.connected = false
        this.connecting = false
        this.closed = false
    }

    connect() {
        this.closed = false
        if (this.ws) {
            this.ws.close()
        }

        this.connecting = true
        this.ws = uni.connectSocket({
            url: this.url,
            success: () => {
                console.log('WebSocket连接创建成功')
            },
            fail: (err) => {
                console.error('WebSocket连接创建失败:', err)
                this.reconnect()
            }
        })

        this.ws.onOpen(() => {
            this.connected = true
            this.connecting = false
            console.log('WebSocket连接已打开')
            this.reconnectCount = 0
            this.startHeartbeat()
        })

        this.ws.onClose(() => {
            this.connected = false
            this.connecting = false
            console.log('WebSocket连接已关闭')
            this.stopHeartbeat()
            this.reconnect()
        })

        this.ws.onError((err) => {
            this.connected = false
            this.connecting = false
            console.error('WebSocket错误:', err)
            this.reconnect()
        })

        this.ws.onMessage((res) => {
            this.connected = true
            const data = res.data
            // 处理心跳响应
            if (data === 'pong') {
                console.log('收到心跳响应')
                return
            }
            // 触发消息回调
            this.messageCallbacks.forEach(callback => callback(data))
        })
    }

    reconnect() {
        this.connected = false
        this.connecting = true
        if (this.closed) return
        if (this.reconnectCount >= this.maxReconnectAttempts) {
            console.log('达到最大重连次数')
            return
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
        }

        this.reconnectTimer = setTimeout(() => {
            console.log(`第${this.reconnectCount + 1}次重连`)
            this.reconnectCount++
            this.connect()
        }, this.reconnectInterval)
    }

    startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer)
        }

        this.heartbeatTimer = setInterval(() => {
            this.send('ping')
        }, this.heartbeatInterval)
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer)
            this.heartbeatTimer = null
        }
    }

    send(data) {
        if (!this.ws) return

        try {
            this.ws.send({
                data: typeof data === 'string' ? data : JSON.stringify(data),
                fail: (err) => {
                    console.error('发送消息失败:', err)
                }
            })
        } catch (err) {
            console.error('发送消息错误:', err)
        }
    }

    onMessage(callback) {
        this.messageCallbacks.push(callback)
    }

    close() {
        this.stopHeartbeat()
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
        }
        this.closed = true
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }
}