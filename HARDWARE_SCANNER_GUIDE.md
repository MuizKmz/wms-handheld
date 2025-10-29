# Hardware Scanner Integration Guide
## AUTOID UTouch C - Stock-In Enhancement

This guide explains how to build and deploy the APK with hardware trigger scanning support for the AUTOID UTouch C handheld device.

---

## 📋 Overview

The Stock-In page now supports **hardware-triggered barcode scanning** using the device's built-in Urovo SDK. Users can scan products by pressing the physical trigger button on the handheld device, eliminating the need for camera-based QR scanning.

### Key Features:
- ✅ **Hardware Trigger Scanning**: Press the physical scan button to capture barcodes
- ✅ **Automatic Backend Integration**: Scanned barcodes are automatically sent to NestJS API
- ✅ **Duplicate Prevention**: Ignores repeated scans within 1 second
- ✅ **Audio Feedback**: Beep sound on successful scan
- ✅ **Visual Feedback**: Toast notification showing scanned barcode
- ✅ **Start/Stop Control**: Toggle hardware scanning on/off
- ✅ **Camera QR Scan**: Original QR camera scan still available as fallback

---

## 🏗️ Architecture

### Hardware Scanner Service (`src/utils/hardware-scanner.js`)

**Purpose**: Manages Urovo SDK integration via HBuilder Native Android Access

**Key Components**:
1. **BroadcastReceiver**: Listens for `android.intent.action.SCANRESULT` broadcasts
2. **Duplicate Prevention**: Filters repeated scans within 1 second threshold
3. **Audio Feedback**: Plays beep using Android ToneGenerator
4. **Callback System**: Triggers callback function with scanned barcode data

**API Methods**:
```javascript
hardwareScanner.init()          // Initialize scanner
hardwareScanner.startScan(cb)   // Start scanning with callback
hardwareScanner.stopScan()      // Stop scanning
hardwareScanner.destroy()       // Cleanup resources
hardwareScanner.getStatus()     // Get scanner status
```

### Stock-In Control Component (`src/views/stock-in/components/ctrl-stock.vue`)

**New Buttons**:
- **START HW / STOP HW**: Toggle hardware scanning
- **QR SCAN**: Camera-based QR scanning (disabled when hardware scanning active)
- **STOCK IN**: Confirm and update EPC status to INBOUND
- **CLEAR**: Clear all scanned tags

**Workflow**:
1. User fills in DO Number and selects receiving entry
2. User clicks "START HW" to activate hardware scanning
3. User presses physical trigger button on device
4. Barcode is scanned and sent to `onHardwareScanResult()`
5. Backend API `/api/epc/query-by-codes` is called to get product details
6. Scanned item appears in the table with SKU Code and Product Name
7. User clicks "STOCK IN" to update EPC status to INBOUND

---

## 🔧 Build Configuration

### Prerequisites

1. **HBuilder X** (Latest version)
2. **Android SDK** (API Level 21+)
3. **Urovo SDK** (Pre-installed on AUTOID UTouch C devices)

### Build Steps

#### 1. Open Project in HBuilder X
```bash
File → Open Directory → Select wms-handheld folder
```

#### 2. Configure App Manifest

**Path**: `manifest.json`

Add Android permissions:
```json
{
  "app-plus": {
    "distribute": {
      "android": {
        "permissions": [
          "<uses-permission android:name=\"android.permission.CAMERA\"/>",
          "<uses-permission android:name=\"android.permission.VIBRATE\"/>",
          "<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>",
          "<uses-permission android:name=\"android.permission.INTERNET\"/>",
          "<uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>",
          "<uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>"
        ]
      }
    }
  }
}
```

#### 3. Configure Backend API URL

**Path**: `src/config/index.js`

Update API base URL to your backend:
```javascript
export const API_BASE_URL = 'http://YOUR_BACKEND_IP:3000/api'
// Example: 'http://192.168.1.100:3000/api'
```

#### 4. Build Android APK

**Option A: Cloud Build (Recommended)**
1. Right-click project → Release → Cloud Package Native App
2. Select platform: Android
3. Configure app name, version, icon
4. Click "Package" and wait for build to complete
5. Download APK from HBuilder cloud

**Option B: Local Build**
1. Run → Phone/Simulator → Custom Base Package → Select Android SDK path
2. Build → Mobile App - Cloud Package → Native App - Local Package
3. Configure Gradle and Android SDK paths
4. Build APK (located in `unpackage/release/apk/`)

#### 5. Install APK on Device

**Via USB**:
```bash
adb install -r wms-handheld.apk
```

**Via File Transfer**:
- Copy APK to device storage
- Use file manager to install

---

## 📱 Usage Guide

### Step 1: Open Stock-In Page
1. Login to WMS Handheld app
2. Navigate to Stock-In page
3. Fill in **DO Number** (e.g., "Test Order")
4. Select **Receiving Entry** from dropdown

### Step 2: Activate Hardware Scanner
1. Click **"START HW"** button (turns red when active)
2. Toast notification: "🔍 Hardware Scan Active"
3. **QR SCAN** button is disabled (hardware scanning has priority)

### Step 3: Scan Products
1. Point device scanner at barcode/QR code
2. Press **physical trigger button** on device
3. Hear **beep sound** on successful scan
4. See toast: "Scanned: CC02ABCDEF..."
5. Scanned item appears in table with:
   - EPC Code
   - SKU Code
   - Product Name

### Step 4: Confirm Stock-In
1. Review scanned items in table
2. Click **"STOCK IN"** button
3. Confirm modal: "Update X EPC(s) status to INBOUND?"
4. Click **OK**
5. Success modal: "✅ Stock In Successful - X EPC(s) updated"

### Step 5: Stop Scanning
- Click **"STOP HW"** button to deactivate hardware scanning
- Or click **"CLEAR"** to clear all scanned tags and reset

---

## 🔍 Troubleshooting

### Problem: Hardware scanner not initializing

**Solution**:
- Check if app has required permissions
- Ensure device is AUTOID UTouch C or compatible Urovo device
- Check console logs for initialization errors
- Reinstall app and grant all permissions

### Problem: No beep sound on scan

**Solution**:
- Check device volume settings
- Ensure notification volume is not muted
- Try manual trigger: `hardwareScanner.triggerScan()`

### Problem: Duplicate scans

**Solution**:
- Duplicate prevention is set to 1 second
- Adjust threshold in `hardware-scanner.js`:
```javascript
this.duplicateThreshold = 2000 // Change to 2 seconds
```

### Problem: Scanned barcode not appearing in table

**Solution**:
- Check if backend is running: `http://YOUR_IP:3000/api/epc/query-by-codes`
- Verify barcode exists in database
- Check console logs for API errors
- Ensure EPC has matching SKU code in database

### Problem: "Not running on Android device" error

**Solution**:
- Hardware scanner only works on Android devices
- For testing in browser/simulator, use "QR SCAN" button instead
- Build and install APK on physical device

---

## 🧪 Testing Checklist

- [ ] Install APK on AUTOID UTouch C device
- [ ] Login to WMS Handheld app
- [ ] Navigate to Stock-In page
- [ ] Fill in DO Number and select receiving entry
- [ ] Click "START HW" - should see "Hardware Scan Active" toast
- [ ] Press physical trigger button - should hear beep
- [ ] Scan test barcode (e.g., `CC02ABCDEF01241025000001`)
- [ ] Verify scanned item appears in table with SKU Code
- [ ] Click "STOCK IN" - should see confirmation modal
- [ ] Confirm - should see success modal
- [ ] Check database: EPC status should be `INBOUND`
- [ ] Click "CLEAR" - table should be empty
- [ ] Click "STOP HW" - should see "Hardware Scan Stopped" toast

---

## 📊 Database Impact

### EPC Status Update

**Before Stock-In**:
```sql
SELECT id, epc_code, status FROM epc WHERE id = 12;
-- Result: id=12, epc_code='CC02ABCDEF01241025000001', status='GENERATED'
```

**After Stock-In**:
```sql
SELECT id, epc_code, status FROM epc WHERE id = 12;
-- Result: id=12, epc_code='CC02ABCDEF01241025000001', status='INBOUND'
```

### API Endpoint Called

**POST** `/api/epc/bulk-update-status`
```json
{
  "ids": [12, 13, 14],
  "status": "INBOUND"
}
```

---

## 🚀 Next Steps

### Future Enhancements:
1. **Batch Scanning**: Scan multiple items and bulk update
2. **Offline Mode**: Cache scans and sync when online
3. **Custom Beep Sounds**: Different sounds for success/error
4. **Vibration Feedback**: Haptic feedback on scan
5. **Scan History**: View last 10 scanned items
6. **Export Scan Log**: Export scanned items to CSV

### Additional Features:
- RFID scanning support (if device has RFID reader)
- Barcode format validation
- Location-based scanning (warehouse/rack/section)
- Photo capture for damaged items
- Signature capture for receiving confirmation

---

## 📞 Support

For issues or questions:
- Check HBuilder X documentation: https://uniapp.dcloud.io/
- Urovo SDK documentation: https://www.urovotech.com/
- Backend API: http://YOUR_IP:3000/api/docs (Swagger)

---

## 📝 Change Log

### Version 1.1.0 (Current)
- ✅ Added hardware trigger scanning support
- ✅ Integrated Urovo SDK via HBuilder Native Access
- ✅ Added duplicate prevention mechanism
- ✅ Added audio beep feedback
- ✅ Added toast notifications for scan feedback
- ✅ Updated UI with START HW / STOP HW buttons
- ✅ Implemented EPC status update to INBOUND
- ✅ Added clear all tags functionality

### Version 1.0.0
- Initial release with camera-based QR scanning
- Basic stock-in flow with DO Number and receiving entry

---

**Built with**: HBuilder X + UniApp + Vue 3 + Urovo SDK  
**Device**: AUTOID UTouch C Handheld Scanner  
**Backend**: NestJS + Prisma + MySQL
