/**
 * Hardware Scanner Service for AUTOID UTouch C (Urovo SDK)
 * Uses HBuilder Native Android Access (plus.android API)
 * Supports both Broadcast Receiver and Direct SDK methods
 */

class HardwareScanner {
    constructor() {
        this.isScanning = false
        this.scanCallback = null
        this.lastScanTime = 0
        this.lastScanCode = ''
        this.duplicateThreshold = 1000 // 1 second duplicate prevention
        this.broadcastReceiver = null
        this.scanEngine = null
        this.isInitialized = false
        this.scanMethod = null // 'broadcast' or 'sdk'
        this.suppressKeyboard = true // attempt to hide soft keyboard when using wedge
    }

    /**
     * Initialize the Urovo scanner
     * Try Keyboard Wedge first (most reliable), then SDK, then Broadcast
     */
    init() {
        // #ifdef APP-PLUS
        try {
            console.log('🔧 Initializing scanner...')
            
            // Method 1: Keyboard Wedge (most reliable - works with your device!)
            const keyboardResult = this.initKeyboardWedge()
            if (keyboardResult.success) {
                this.scanMethod = 'keyboard'
                this.isInitialized = true
                console.log('✅ Scanner initialized via Keyboard Wedge')
                return keyboardResult
            }
            
            console.warn('⚠️ Keyboard Wedge failed, trying SDK method...')
            
            // Method 2: Try Urovo Scanner SDK API
            const sdkResult = this.initScannerSDK()
            if (sdkResult.success) {
                this.scanMethod = 'sdk'
                this.isInitialized = true
                console.log('✅ Scanner initialized via SDK')
                return sdkResult
            }
            
            console.warn('⚠️ SDK init failed, trying broadcast method...')
            
            // Method 3: Fallback to Broadcast Receiver
            const broadcastResult = this.initBroadcastReceiver()
            if (broadcastResult.success) {
                this.scanMethod = 'broadcast'
                this.isInitialized = true
                console.log('✅ Scanner initialized via Broadcast')
                return broadcastResult
            }
            
            console.error('❌ All methods failed')
            return { success: false, message: 'Failed to initialize scanner' }
        } catch (e) {
            console.error('❌ Scanner init failed:', e)
            return { success: false, message: e.message }
        }
        // #endif

        // #ifndef APP-PLUS
        return { success: false, message: 'Not running on Android device' }
        // #endif
    }

    /**
     * Initialize Keyboard Wedge input capture
     * Scanner types barcode like keyboard input
     */
    initKeyboardWedge() {
        try {
            console.log('⌨️ Setting up Keyboard Wedge listener...')
            
            // Create buffer to accumulate keystrokes
            this.keyboardBuffer = ''
            this.keyboardTimer = null
            // #ifdef APP-PLUS
            // Hide soft keyboard proactively
            try {
                const main = plus.android.runtimeMainActivity()
                const Context = plus.android.importClass('android.content.Context')
                const InputMethodManager = plus.android.importClass('android.view.inputmethod.InputMethodManager')
                const imm = main.getSystemService(Context.INPUT_METHOD_SERVICE)
                if (imm) {
                    imm.hideSoftInputFromWindow(main.getWindow().getDecorView().getWindowToken(), 0)
                    console.log('🛡️ Soft keyboard hide requested')
                }
            } catch (hideErr) {
                console.warn('⚠️ Cannot hide keyboard:', hideErr)
            }
            // #endif
            
            // Listen for document-level keypress events
            this.keyboardHandler = (e) => {
                console.log('⌨️ KEY EVENT:', e.type, 'key:', e.key, 'keyCode:', e.keyCode, 'isScanning:', this.isScanning)
                
                // Only capture when scanner is active
                if (!this.isScanning) {
                    console.log('⚠️ Scanning not active, ignoring key')
                    return
                }
                if (this.suppressKeyboard) {
                    try { e.preventDefault(); e.stopPropagation(); } catch(_) {}
                }
                
                // Clear existing timer
                if (this.keyboardTimer) {
                    clearTimeout(this.keyboardTimer)
                }

                const key = e.key || String.fromCharCode(e.keyCode)
                console.log('⌨️ Processing key:', key)
                
                // Enter key signals end of barcode
                if (key === 'Enter' || e.keyCode === 13) {
                    if (this.keyboardBuffer.length > 0) {
                        console.log('⌨️ Keyboard input complete:', this.keyboardBuffer)
                        this.handleScanResult(this.keyboardBuffer, 'keyboard')
                        this.keyboardBuffer = ''
                    }
                    e.preventDefault()
                    e.stopPropagation()
                    return
                }

                // Accumulate printable characters
                if (key.length === 1 && key >= ' ' && key <= '~') {
                    this.keyboardBuffer += key
                    console.log('⌨️ Buffer now:', this.keyboardBuffer)
                    
                    // Auto-complete after 200ms of no input (scanner types very fast)
                    this.keyboardTimer = setTimeout(() => {
                        if (this.keyboardBuffer.length > 0) {
                            console.log('⌨️ Keyboard timeout complete:', this.keyboardBuffer)
                            this.handleScanResult(this.keyboardBuffer, 'keyboard')
                            this.keyboardBuffer = ''
                        }
                    }, 200)
                }
            }

            // Attach listeners to document
            document.addEventListener('keypress', this.keyboardHandler, true)
            document.addEventListener('keydown', this.keyboardHandler, true)
            
            console.log('✅ Keyboard Wedge listener ready')
            return { success: true, message: 'Keyboard Wedge initialized' }

        } catch (error) {
            console.error('❌ Keyboard Wedge init failed:', error)
            return { success: false, message: error.message }
        }
    }

    /**
     * Initialize using Urovo Scanner SDK API (Direct method)
     */
    initScannerSDK() {
        // #ifdef APP-PLUS
        try {
            console.log('📡 Trying Urovo Scanner SDK...')
            const main = plus.android.runtimeMainActivity()
            
            // Import Urovo Scanner classes
            const ScanManager = plus.android.importClass('com.urovo.sdk.scannermanager.ScanManager')
            
            if (!ScanManager) {
                console.warn('⚠️ ScanManager class not found')
                return { success: false, message: 'ScanManager not available' }
            }
            
            // Get scanner instance
            this.scanEngine = ScanManager.getInstance(main)
            
            if (!this.scanEngine) {
                console.warn('⚠️ ScanManager getInstance returned null')
                return { success: false, message: 'Scanner instance not available' }
            }
            
            console.log('✅ ScanManager instance obtained')
            
            // Create scanner callback
            const IScannerCallback = plus.android.importClass('com.urovo.sdk.scannermanager.IScannerCallback')
            
            this.scannerCallback = plus.android.implements('com.urovo.sdk.scannermanager.IScannerCallback', {
                onScannerResult: (resultCode, result) => {
                    console.log('📦 Scanner callback - Code:', resultCode, 'Result:', result)
                    if (resultCode === 0 && result) {
                        const barcode = result.toString()
                        console.log('✅ Scanned:', barcode)
                        this.handleScanResult(barcode, 'SDK')
                    }
                },
                onScannerInitialized: () => {
                    console.log('✅ Scanner initialized callback')
                },
                onScannerTerminated: () => {
                    console.log('⏹️ Scanner terminated callback')
                }
            })
            
            // Set callback
            this.scanEngine.setScannerCallback(this.scannerCallback)
            
            // Enable scanner
            this.scanEngine.enable()
            
            console.log('✅ Urovo SDK initialized successfully')
            return { success: true, message: 'SDK initialized' }
            
        } catch (e) {
            console.error('❌ SDK init error:', e)
            return { success: false, message: e.message }
        }
        // #endif
        
        return { success: false, message: 'Not on Android' }
    }

    /**
     * Initialize using Broadcast Receiver (Fallback method)
     */
    initBroadcastReceiver() {
        // #ifdef APP-PLUS
        try {
            console.log('📡 Trying Broadcast Receiver...')
            const main = plus.android.runtimeMainActivity()
            const IntentFilter = plus.android.importClass('android.content.IntentFilter')

            // AUTOID UTouch C / Urovo SDK broadcast actions
            const SCAN_ACTIONS = [
                'android.intent.action.SCANRESULT',
                'com.android.server.scannerservice.broadcast',
                'urovo.rcv.message',
                'scan.rcv.message',
                'android.intent.ACTION_DECODE_DATA',
                'com.scanner.broadcast' // Additional action
            ]
            
            const BARCODE_KEYS = [
                'barocode', 'barcode', 'value', 'scannerdata', 
                'data', 'SCAN_BARCODE1', 'decode_result'
            ]

            this.broadcastReceiver = plus.android.implements('android.content.BroadcastReceiver', {
                onReceive: (context, intent) => {
                    try {
                        const action = intent.getAction()
                        console.log('📡 Broadcast received:', action)
                        
                        if (SCAN_ACTIONS.includes(action)) {
                            let barcode = null
                            let barcodeType = null
                            
                            for (const key of BARCODE_KEYS) {
                                const value = intent.getStringExtra(key)
                                if (value) {
                                    barcode = value
                                    console.log(`✅ Found barcode with key '${key}':`, barcode)
                                    break
                                }
                            }
                            
                            const typeKeys = ['barocodetype', 'barcodetype', 'type', 'decode_type']
                            for (const key of typeKeys) {
                                const value = intent.getStringExtra(key)
                                if (value) {
                                    barcodeType = value
                                    break
                                }
                            }
                            
                            if (!barcode) {
                                const extras = intent.getExtras()
                                if (extras) {
                                    for (const key of BARCODE_KEYS) {
                                        const value = extras.getString(key)
                                        if (value) {
                                            barcode = value
                                            console.log(`✅ Found barcode in bundle with key '${key}':`, barcode)
                                            break
                                        }
                                    }
                                }
                            }
                            
                            if (barcode) {
                                this.handleScanResult(barcode, barcodeType)
                            } else {
                                console.warn('⚠️ Scan broadcast received but no barcode data found')
                            }
                        }
                    } catch (e) {
                        console.error('❌ Scan receive error:', e)
                    }
                }
            })

            const filter = new IntentFilter()
            SCAN_ACTIONS.forEach(action => {
                filter.addAction(action)
            })
            main.registerReceiver(this.broadcastReceiver, filter)

            console.log('✅ Broadcast receiver registered')
            return { success: true, message: 'Broadcast initialized' }
        } catch (e) {
            console.error('❌ Broadcast init failed:', e)
            return { success: false, message: e.message }
        }
        // #endif

        return { success: false, message: 'Not on Android' }
    }

    /**
     * Start hardware scanning
     * @param {Function} callback - Called when barcode is scanned (barcode, type)
     */
    startScan(callback) {
        if (!this.isInitialized) {
            const initResult = this.init()
            if (!initResult.success) {
                return initResult
            }
        }

        this.isScanning = true
        this.scanCallback = callback
        console.log('🔍 Hardware scanning started')
        
        return { success: true, message: 'Scanning started' }
    }

    /**
     * Stop hardware scanning
     */
    stopScan() {
        this.isScanning = false
        this.scanCallback = null
        console.log('⏹️ Hardware scanning stopped')
        
        return { success: true, message: 'Scanning stopped' }
    }

    /**
     * Handle scan result from broadcast receiver
     * @param {String} barcode - Scanned barcode data
     * @param {String} barcodeType - Type of barcode
     */
    handleScanResult(barcode, barcodeType) {
        if (!this.isScanning) {
            return
        }

        // Duplicate prevention - ignore same barcode within threshold
        const now = Date.now()
        if (barcode === this.lastScanCode && (now - this.lastScanTime) < this.duplicateThreshold) {
            console.log('⚠️ Duplicate scan ignored:', barcode)
            return
        }

        this.lastScanCode = barcode
        this.lastScanTime = now

        console.log('📦 Scanned:', barcode, 'Type:', barcodeType)

        // Play beep sound
        this.playBeep()

        // Trigger callback
        if (this.scanCallback && typeof this.scanCallback === 'function') {
            this.scanCallback(barcode, barcodeType)
        }
        // Reset keyboard buffer to allow continuous scanning
        if (this.keyboardBuffer !== undefined) {
            this.keyboardBuffer = ''
        }
    }

    /**
     * Play beep sound for scan feedback
     */
    playBeep() {
        // #ifdef APP-PLUS
        try {
            try {
                const ToneGenerator = plus.android.importClass('android.media.ToneGenerator')
                const AudioManager = plus.android.importClass('android.media.AudioManager')
                const toneGen = new ToneGenerator(AudioManager.STREAM_NOTIFICATION, 100)
                toneGen.startTone(ToneGenerator.TONE_PROP_BEEP, 150)
                setTimeout(() => { toneGen.release() }, 200)
            } catch (primaryErr) {
                console.warn('⚠️ Primary beep failed, fallback:', primaryErr)
                try {
                    const RingtoneManager = plus.android.importClass('android.media.RingtoneManager')
                    const context = plus.android.runtimeMainActivity()
                    const uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                    const ringtone = RingtoneManager.getRingtone(context, uri)
                    ringtone.play()
                } catch (fallbackErr) {
                    console.error('❌ Fallback beep failed:', fallbackErr)
                }
            }
        } catch (e) {
            console.error('Beep error outer:', e)
        }
        // #endif
    }

    /**
     * Manually trigger scan (for testing)
     */
    triggerScan() {
        // #ifdef APP-PLUS
        try {
            const Intent = plus.android.importClass('android.content.Intent')
            const main = plus.android.runtimeMainActivity()
            
            // Trigger Urovo scan intent
            const intent = new Intent('android.intent.action.SCAN_BUTTON_DOWN')
            main.sendBroadcast(intent)
            
            return { success: true, message: 'Scan triggered' }
        } catch (e) {
            console.error('Trigger scan error:', e)
            return { success: false, message: e.message }
        }
        // #endif

        // #ifndef APP-PLUS
        return { success: false, message: 'Not running on Android device' }
        // #endif
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // #ifdef APP-PLUS
        try {
            // Cleanup keyboard listener
            if (this.keyboardHandler) {
                document.removeEventListener('keypress', this.keyboardHandler, true)
                document.removeEventListener('keydown', this.keyboardHandler, true)
                if (this.keyboardTimer) {
                    clearTimeout(this.keyboardTimer)
                }
                this.keyboardHandler = null
                this.keyboardBuffer = ''
                this.keyboardTimer = null
                console.log('🧹 Keyboard listener removed')
            }
            
            // Cleanup SDK
            if (this.scanEngine) {
                try {
                    this.scanEngine.disable()
                    this.scanEngine.setScannerCallback(null)
                    console.log('🧹 Scanner SDK disabled')
                } catch (e) {
                    console.error('Error disabling scanner SDK:', e)
                }
                this.scanEngine = null
            }
            
            // Cleanup broadcast receiver
            if (this.broadcastReceiver) {
                const main = plus.android.runtimeMainActivity()
                main.unregisterReceiver(this.broadcastReceiver)
                this.broadcastReceiver = null
                console.log('🧹 Broadcast receiver unregistered')
            }
            
            // Cleanup debug receiver
            if (this.debugReceiver) {
                const main = plus.android.runtimeMainActivity()
                main.unregisterReceiver(this.debugReceiver)
                this.debugReceiver = null
            }
            
            this.isInitialized = false
            this.isScanning = false
            this.scanCallback = null
            this.scanMethod = null
            console.log('🧹 Hardware scanner destroyed')
        } catch (e) {
            console.error('Destroy error:', e)
        }
        // #endif
    }

    /**
     * Check if scanner is ready
     */
    isReady() {
        return this.isInitialized
    }

    /**
     * Get scanner status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            scanning: this.isScanning,
            lastScan: this.lastScanCode,
            lastScanTime: this.lastScanTime
        }
    }

    /**
     * Enable debug mode - logs ALL broadcasts received
     * Use this to discover what broadcast action your device uses
     */
    enableDebugMode() {
        // #ifdef APP-PLUS
        try {
            const main = plus.android.runtimeMainActivity()
            const IntentFilter = plus.android.importClass('android.content.IntentFilter')

            console.log('🐛 Enabling debug mode...')

            // Create debug receiver that catches ALL broadcasts
            this.debugReceiver = plus.android.implements('android.content.BroadcastReceiver', {
                onReceive: (context, intent) => {
                    try {
                        const action = intent.getAction()
                        console.log('🔍 ==========================================')
                        console.log('🔍 DEBUG - Broadcast Action:', action)
                        
                        // Log all extras
                        const extras = intent.getExtras()
                        if (extras) {
                            console.log('📦 Extras found:')
                            const keySet = extras.keySet()
                            const iterator = keySet.iterator()
                            
                            while (iterator.hasNext()) {
                                const key = iterator.next()
                                const value = extras.get(key)
                                console.log(`  ✓ ${key} = ${value}`)
                            }
                        } else {
                            console.log('📦 No extras found')
                        }
                        
                        // Try getting scannerdata specifically
                        const scannerdata = intent.getStringExtra('scannerdata')
                        if (scannerdata) {
                            console.log('🎯 FOUND scannerdata:', scannerdata)
                        }
                        
                        console.log('🔍 ==========================================')
                    } catch (e) {
                        console.error('Debug receiver error:', e)
                    }
                }
            })

            // Register for the specific action from your device
            const filter = new IntentFilter()
            filter.addAction('com.android.server.scannerservice.broadcast') // Your device's action
            filter.addAction('android.intent.action.SCANRESULT') // Backup
            filter.addAction('urovo.rcv.message') // Backup
            filter.addAction('scan.rcv.message') // Backup
            
            main.registerReceiver(this.debugReceiver, filter)
            
            console.log('🐛 Debug mode enabled!')
            console.log('📡 Listening for action: com.android.server.scannerservice.broadcast')
            console.log('👉 Now press the TRIGGER button!')
            
            return { success: true, message: 'Debug mode enabled' }
        } catch (e) {
            console.error('Debug mode error:', e)
            return { success: false, message: e.message }
        }
        // #endif
        
        return { success: false, message: 'Not on Android' }
    }

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        // #ifdef APP-PLUS
        try {
            if (this.debugReceiver) {
                const main = plus.android.runtimeMainActivity()
                main.unregisterReceiver(this.debugReceiver)
                this.debugReceiver = null
                console.log('🐛 Debug mode disabled')
            }
        } catch (e) {
            console.error('Disable debug error:', e)
        }
        // #endif
    }
}

// Export singleton instance
const hardwareScanner = new HardwareScanner()

export default hardwareScanner
