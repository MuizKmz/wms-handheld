# 🚀 Complete APK Build Guide - HBuilder X Cloud Package
## Step-by-Step Instructions for AUTOID UTouch C Hardware Scanner

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **HBuilder X** installed (Download: https://www.dcloud.io/hbuilderx.html)
- [ ] **DCloud Account** (Required for cloud packaging)
- [ ] **Project Source Code** in `wms-handheld` folder
- [ ] **Backend Running** and accessible from your network
- [ ] **Test Device** (AUTOID UTouch C) connected or available

---

## 🔧 Part 1: Configure Your Project

### Step 1: Open Project in HBuilder X

1. Launch **HBuilder X**
2. Click **File** → **Open Directory**
3. Navigate to: `C:\Users\Lenovo\Desktop\Job\Evolve Technology\WMS\New WMS\wms-handheld`
4. Click **Select Folder**

**✅ Verification**: You should see the project structure in the left sidebar:
```
wms-handheld/
├── src/
├── public/
├── manifest.json
├── pages.json
├── package.json
└── ...
```

---

### Step 2: Configure Backend API URL

1. In HBuilder X, navigate to: `src/config/index.js`
2. Find the line:
   ```javascript
   export const API_BASE_URL = 'http://localhost:3000/api'
   ```
3. Change it to your backend server IP:
   ```javascript
   // Replace with your actual backend IP address
   export const API_BASE_URL = 'http://192.168.1.100:3000/api'
   // or
   export const API_BASE_URL = 'http://172.19.1.22:3000/api'
   ```
4. Save the file (Ctrl + S)

**⚠️ Important**: 
- Use your **actual backend IP**, not `localhost`
- Ensure backend is accessible from handheld device network
- Test URL in browser: `http://YOUR_IP:3000/api/docs`

---

### Step 3: Configure App Manifest

1. Open `manifest.json` in the root folder
2. Click on the **App Basic Information** tab (基础配置)
3. Fill in the following:

**App Information**:
- **App Name**: `WMS Handheld`
- **App Version**: `1.1.0`
- **Version Code**: `110`

**App Icons** (Click to upload):
- **App Icon**: Upload a 1024x1024 PNG image (your company logo)

4. Click on **App Module Configuration** tab (模块配置)

**Permissions** - Ensure these are checked:
- ✅ Camera (相机)
- ✅ Geolocation (定位)
- ✅ Network (网络)
- ✅ File System (文件系统)

5. Click on **App Permissions Configuration** tab (权限配置)

Add these Android permissions:
```xml
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
```

6. Save the file (Ctrl + S)

---

### Step 4: Login to DCloud Account

1. In HBuilder X, click **View** → **Show Console** (底部控制台)
2. Look for login status in the bottom right corner
3. If not logged in:
   - Click on **未登录** (Not Logged In)
   - Enter your **DCloud Account** credentials
   - If you don't have an account, register at: https://dev.dcloud.net.cn/

**✅ Verification**: Bottom right should show your username/email

---

## 📦 Part 2: Build APK with Cloud Package

### Step 5: Start Cloud Packaging

1. In HBuilder X, right-click on the **project root** (`wms-handheld`) in the left sidebar
2. Navigate to: **Release** → **Native App - Cloud Package** (发行 → 原生App - 云打包)

**📸 Path**:
```
Right-click wms-handheld
  └─ 发行 (Release)
       └─ 原生App-云打包 (Native App - Cloud Package)
```

---

### Step 6: Configure Android Packaging Options

A dialog window will appear with packaging options:

#### **Basic Settings** (基础设置):

**Platform Selection**:
- ✅ **Android** (Check this box)
- ⬜ iOS (Leave unchecked)

**App Information**:
- **App Name** (应用名称): `WMS Handheld`
- **App Version** (应用版本号): `1.1.0`
- **App Version Code** (应用版本号): `110`

#### **Android Packaging Options** (Android打包配置):

**Package Name** (包名):
```
com.evolvewms.handheld
```
*Note: Must be unique, reverse domain format*

**Target API Level** (目标API级别):
- Select: `Android 11.0 (API Level 30)` or higher

**Minimum API Level** (最低API级别):
- Select: `Android 5.0 (API Level 21)`

**Build Type** (打包类型):
- Select: **Release** (正式版)

**Signing Configuration** (签名配置):

**Option A: Use DCloud Test Certificate** (使用DCloud测试证书)
- Select this option for initial testing
- ✅ Check: "使用DCloud公用测试证书"

**Option B: Use Your Own Certificate** (使用自有证书)
- For production builds
- You'll need to create a keystore file first

For now, use **Option A** (DCloud Test Certificate)

---

### Step 7: Configure Advanced Options

Click on **Advanced Options** (高级设置) tab:

**SDK Configuration**:
- **UniApp Version**: Use latest stable version
- **Compile Mode**: Fast (快速编译)

**Orientation** (屏幕方向):
- Select: **Portrait** (竖屏)

**Permissions** (权限配置):
- Ensure all required permissions are listed
- Add custom permissions if needed

**Features** (功能配置):
- ✅ Enable: "使用原生隐私政策提示框"
- ✅ Enable: "使用X5内核"

---

### Step 8: Start Building

1. Review all settings carefully
2. Click **Package** button (打包) at the bottom right
3. A confirmation dialog appears - Click **OK**

**Build Process**:
- Upload source code to DCloud servers: ~30-60 seconds
- Cloud compilation: ~3-5 minutes
- Package generation: ~1-2 minutes

**📊 Progress Indicators**:
- Console shows: "开始打包..." (Starting packaging...)
- Progress bar appears at bottom
- Console logs show build steps

**✅ Success Message**:
```
打包成功！(Packaging successful!)
下载地址：https://...
```

---

### Step 9: Download APK

1. When build completes, console shows download URL
2. Click the **Download** link (下载地址)
3. Or copy URL and paste in browser
4. Save APK to your computer:
   - Recommended location: `C:\APK\wms-handheld-v1.1.0.apk`

**APK File Info**:
- **Filename**: `wms-handheld_1.1.0_20251029.apk` (auto-generated with date)
- **Size**: ~15-25 MB (typical size)
- **Valid for**: 30 days (test certificate)

---

## 📱 Part 3: Install APK on Device

### Method A: Install via USB Cable

**Prerequisites**:
- USB cable
- ADB installed (Android Debug Bridge)
- USB debugging enabled on device

**Steps**:

1. **Enable USB Debugging on AUTOID UTouch C**:
   - Go to: **Settings** → **About Phone**
   - Tap **Build Number** 7 times (enables Developer Mode)
   - Go back to **Settings** → **Developer Options**
   - Enable **USB Debugging**

2. **Connect Device to PC**:
   - Connect USB cable
   - Device prompts: "Allow USB debugging?" → Tap **OK**

3. **Install APK using ADB**:
   ```powershell
   # Navigate to APK location
   cd C:\APK
   
   # Check device connected
   adb devices
   # Should show: List of devices attached
   #              XXXXXX    device
   
   # Install APK
   adb install -r wms-handheld-v1.1.0.apk
   ```

4. **Wait for installation**:
   ```
   Performing Streamed Install
   Success
   ```

---

### Method B: Install via File Transfer

**Steps**:

1. **Copy APK to Device**:
   - Connect device via USB (File Transfer mode)
   - Copy APK to device: `Internal Storage\Download\`
   - Or use Google Drive / Email to transfer

2. **Install on Device**:
   - On device, open **File Manager** app
   - Navigate to **Download** folder
   - Tap on `wms-handheld-v1.1.0.apk`
   - Tap **Install**
   - If prompted "Install from unknown sources", tap **Settings**
   - Enable **Allow from this source**
   - Go back and tap **Install** again

3. **Wait for installation**:
   - Progress bar appears
   - "App installed" message
   - Tap **Open** to launch

---

### Method C: Install via QR Code (Cloud Distribution)

**Steps**:

1. **Generate QR Code** (in HBuilder X):
   - After build completes, click **Generate QR Code** button
   - QR code appears with download link

2. **Scan QR Code**:
   - On AUTOID UTouch C, open browser
   - Scan QR code or manually enter URL
   - Download APK
   - Install as per Method B

---

## ✅ Part 4: Verify Installation

### Step 10: Launch and Test App

1. **Open WMS Handheld App**:
   - Find app icon on home screen or app drawer
   - Icon shows: WMS logo with "WMS Handheld" label

2. **Login**:
   - Username: (your test account)
   - Password: (your test password)

3. **Navigate to Stock-In**:
   - From main menu, tap **Stock-In**

4. **Test Hardware Scanner**:
   - Fill in **DO Number**: `Test Order`
   - Select **Receiving Entry** from dropdown
   - Tap **"START HW"** button
   - Button should turn **RED**
   - Toast: "🔍 Hardware Scan Active"

5. **Scan Test Barcode**:
   - Press **physical trigger button** on device
   - Should hear **BEEP** sound
   - Toast appears: "Scanned: CC02..."
   - Item appears in table with SKU Code

6. **Complete Stock-In**:
   - Tap **"STOCK IN"** button
   - Confirm modal appears
   - Tap **OK**
   - Success modal: "✅ Stock In Successful"

---

## 🐛 Troubleshooting

### Build Failed

**Error**: "应用版本号格式错误" (Version format error)
**Solution**: Change version to format `1.1.0` (three numbers with dots)

**Error**: "包名格式错误" (Package name format error)
**Solution**: Use reverse domain format: `com.company.app`

**Error**: "证书配置错误" (Certificate configuration error)
**Solution**: Use DCloud test certificate for initial builds

---

### Installation Failed

**Error**: "App not installed"
**Solution**: 
- Uninstall old version first
- Check storage space (need ~50MB free)
- Enable "Install from unknown sources"

**Error**: "Parse error: There was a problem parsing the package"
**Solution**:
- APK file may be corrupted - re-download
- Check if APK is compatible with device (API level)

---

### Hardware Scanner Not Working

**Problem**: "START HW" button does nothing
**Solution**:
- Check if app has camera/storage permissions
- Go to: **Settings** → **Apps** → **WMS Handheld** → **Permissions**
- Grant all permissions

**Problem**: No beep sound when scanning
**Solution**:
- Check device volume (notification volume)
- Ensure device is not in silent mode

**Problem**: Physical trigger button not working
**Solution**:
- Restart app
- Ensure device is AUTOID UTouch C (compatible with Urovo SDK)
- Check if other scanner apps work (to verify hardware)

---

## 📊 Build Options Comparison

| Option | DCloud Test Cert | Your Own Cert |
|--------|------------------|---------------|
| **Build Time** | 3-5 mins | 3-5 mins |
| **Validity** | 30 days | Unlimited |
| **Google Play** | ❌ Not allowed | ✅ Allowed |
| **Production Use** | ❌ Testing only | ✅ Yes |
| **Cost** | Free | Free (DIY) |

**Recommendation**: 
- Use **DCloud Test Certificate** for development/testing
- Create **Your Own Certificate** for production release

---

## 🔐 Creating Your Own Certificate (For Production)

### Generate Keystore File

1. **Open Command Prompt** (as Administrator)

2. **Navigate to Java JDK bin** (if keytool not in PATH):
   ```cmd
   cd C:\Program Files\Java\jdk-17\bin
   ```

3. **Generate Keystore**:
   ```cmd
   keytool -genkey -v -keystore wms-handheld.keystore -alias wms-handheld -keyalg RSA -keysize 2048 -validity 10000
   ```

4. **Fill in Details**:
   ```
   Enter keystore password: [Create strong password, e.g., WMS2025!@#]
   Re-enter new password: [Same password]
   
   What is your first and last name? Evolve Technology
   What is your name of your organizational unit? Development
   What is the name of your organization? Evolve Technology Sdn Bhd
   What is the name of your City or Locality? Johor Bahru
   What is the name of your State or Province? Johor
   What is the two-letter country code? MY
   
   Is CN=Evolve Technology, OU=Development, ... correct? yes
   
   Enter key password for <wms-handheld>: [Press ENTER to use same password]
   ```

5. **Save Keystore File**:
   - File created: `wms-handheld.keystore`
   - Move to safe location: `C:\Certificates\wms-handheld.keystore`
   - **BACKUP THIS FILE** - cannot be recreated!

6. **Use in HBuilder X**:
   - In packaging dialog, select "使用自有证书"
   - Browse and select `wms-handheld.keystore`
   - Enter alias: `wms-handheld`
   - Enter password: [your keystore password]

---

## 📝 Build Checklist

Use this checklist before each build:

**Pre-Build**:
- [ ] Backend API URL updated in `src/config/index.js`
- [ ] App version incremented in `manifest.json`
- [ ] All features tested in HBuilder X preview
- [ ] No console errors or warnings
- [ ] Backend server running and accessible

**Build Settings**:
- [ ] Correct package name (com.evolvewms.handheld)
- [ ] Correct version (1.1.0) and version code (110)
- [ ] Android platform selected
- [ ] Release build type selected
- [ ] Certificate configured (test or production)

**Post-Build**:
- [ ] APK downloaded successfully
- [ ] APK file size reasonable (~15-25MB)
- [ ] APK installs on test device
- [ ] App launches without crashes
- [ ] Hardware scanner works (beep + scan)
- [ ] Stock-in flow completes successfully

---

## 🚀 Next Steps After Successful Build

1. **Test Thoroughly**:
   - Test all pages and features
   - Test with different DO Numbers
   - Test scanning multiple items
   - Test error scenarios (no network, invalid barcode)

2. **Deploy to Users**:
   - Share APK via company internal portal
   - Or upload to Google Play Store (requires own certificate)
   - Provide training to warehouse staff

3. **Monitor Performance**:
   - Check backend logs for API errors
   - Collect user feedback
   - Track scanning success rate

4. **Plan Updates**:
   - Bug fixes based on user feedback
   - New features (RFID scanning, offline mode)
   - Performance optimizations

---

## 📞 Support Resources

**HBuilder X Documentation**:
- Chinese: https://uniapp.dcloud.io/tutorial/
- English: https://en.uniapp.dcloud.io/

**DCloud Forum**:
- https://ask.dcloud.net.cn/explore/

**Urovo SDK Documentation**:
- Contact: support@urovotech.com

**Your Backend API**:
- Swagger Docs: http://YOUR_IP:3000/api/docs

---

## 📌 Quick Reference

**Build Command** (via HBuilder X):
```
Right-click Project → Release → Native App - Cloud Package
```

**Install Command** (via ADB):
```powershell
adb install -r wms-handheld-v1.1.0.apk
```

**Test Hardware Scanner**:
```
1. Open app → Login
2. Navigate to Stock-In
3. Fill DO Number → Select Receiving
4. Tap "START HW" → Press Trigger Button
5. Hear beep → See scanned item
6. Tap "STOCK IN" → Confirm
```

---

**Last Updated**: October 29, 2025  
**Version**: 1.1.0  
**Build Tool**: HBuilder X Cloud Package  
**Target Device**: AUTOID UTouch C
