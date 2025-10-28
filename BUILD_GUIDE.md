# WMS Handheld SDK - Build & Deployment Guide

## Prerequisites

### Software Requirements
- **Node.js:** v16.x or higher (recommended v18.x)
- **npm:** v8.x or higher
- **HBuilderX:** (Optional, for easier native app builds)

### For Native App Builds
- **Android:**
  - Android Studio 2021.x or higher
  - Android SDK API Level 21+ (Android 5.0+)
  - Java JDK 11 or higher
  
- **iOS:**
  - macOS with Xcode 13+ 
  - iOS SDK 11.0+
  - Apple Developer Account (for distribution)

---

## Quick Start

### 1. Install Dependencies
```powershell
cd "c:\Users\Lenovo\Desktop\Job\Evolve Technology\WMS\New WMS\wms-handheld"
npm install
```

### 2. Configure Backend URL
Edit `.env` file:
```env
VITE_API_BASE_URL=http://YOUR_BACKEND_IP:3000
VITE_IMG_BASE_URL=http://YOUR_BACKEND_IP:3000
VITE_APP_URL=http://YOUR_BACKEND_IP:3000
VITE_WSS_BASE_URL=ws://YOUR_BACKEND_IP:3000
```

**Important:** Replace `YOUR_BACKEND_IP` with:
- `localhost` for local testing
- Your server's IP address (e.g., `192.168.1.100`) for handheld device access
- Your domain name for production

### 3. Run Development Server
```powershell
# Web browser testing (fastest for development)
npm run dev:h5

# Native app preview (requires HBuilderX or native environment)
npm run dev:app
```

---

## Build for Production

### Option 1: Web Build (H5)
Best for testing on any mobile browser.

```powershell
npm run build:h5
```

**Output Location:** `dist/build/h5/`

**Deployment:**
1. Copy contents of `dist/build/h5/` to your web server
2. Configure web server to serve static files
3. Access via: `http://YOUR_SERVER/index.html`

---

### Option 2: Android APK Build

#### Method A: Using HBuilderX (Recommended)
1. **Download HBuilderX:**
   - Visit: https://www.dcloud.io/hbuilderx.html
   - Download and install

2. **Open Project:**
   - Launch HBuilderX
   - File → Open Folder → Select `wms-handheld` directory

3. **Configure App:**
   - Open `manifest.json`
   - Update App Name, Version, Icon
   - Set Package Name (e.g., `com.evolve.wms`)

4. **Cloud Build (Easiest):**
   - Click "Publish" → "Native App - Cloud Packaging"
   - Select "Android"
   - Choose "Release" or "Debug"
   - Click "Package"
   - Download APK when ready

5. **Local Build (Advanced):**
   - Run → Device → Run to Custom Base
   - Select your connected Android device
   - APK generated automatically

#### Method B: Manual CLI Build
```powershell
npm run build:app
```

**Post-Build Steps:**
1. Navigate to: `dist/build/app/`
2. Import into Android Studio
3. Configure signing keys
4. Build → Generate Signed APK
5. Distribute APK file

---

### Option 3: iOS IPA Build

#### Method A: Using HBuilderX
1. Open project in HBuilderX
2. Click "Publish" → "Native App - Cloud Packaging"
3. Select "iOS"
4. Provide Apple Developer Certificate
5. Download IPA when ready

#### Method B: Manual Build
```powershell
npm run build:app-ios
```

**Post-Build Steps:**
1. Navigate to: `dist/build/app-ios/`
2. Open in Xcode
3. Configure signing & provisioning profile
4. Product → Archive
5. Distribute via TestFlight or Ad-Hoc

---

## Device-Specific Builds

### For Zebra Handheld Devices
Zebra devices often use EMDK for RFID scanning.

1. Build base APK using HBuilderX
2. Export native Android project:
   - In HBuilderX: Run → Device → Generate Local App Resources
3. Open in Android Studio
4. Add Zebra EMDK SDK:
   ```gradle
   dependencies {
       implementation 'com.symbol:emdk:9.1'
   }
   ```
5. Integrate RFID scanner code in native modules
6. Rebuild APK

### For Honeywell Devices
Similar process with Honeywell SDK integration.

### For Chainway/Urovo Devices
These typically support standard Android APIs.

---

## Install on Handheld Device

### Android Installation

#### Method 1: USB Connection
```powershell
# Connect device via USB
# Enable USB debugging on device
adb install dist/build/app/android/app-release.apk
```

#### Method 2: Direct Transfer
1. Copy APK to device via USB/SD card
2. On device, go to Settings → Security
3. Enable "Install from Unknown Sources"
4. Use file manager to locate APK
5. Tap to install

#### Method 3: QR Code (Easiest)
1. Upload APK to web server
2. Generate QR code with download link
3. Scan QR code from device
4. Download and install

---

## Testing Checklist

### Before Deployment
- [ ] Update `.env` with production backend URL
- [ ] Test login with real credentials
- [ ] Test stock-in operation with RFID/QR scanner
- [ ] Test stock-out operation
- [ ] Verify EPC status updates in backend
- [ ] Test offline behavior (should show error)
- [ ] Test on actual handheld device (not just emulator)

### Performance Checks
- [ ] App loads within 3 seconds
- [ ] RFID scanning responds < 1 second
- [ ] API calls complete within 5 seconds
- [ ] No memory leaks during extended use
- [ ] Battery drain is acceptable

---

## Troubleshooting

### Build Errors

**Error:** "Cannot find module '@dcloudio/uni-app'"
```powershell
# Solution: Reinstall dependencies
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

**Error:** "ENOENT: no such file or directory"
```powershell
# Solution: Clean dist folder
Remove-Item dist -Recurse -Force
npm run build:app
```

**Error:** "Java heap space" during Android build
```powershell
# Solution: Increase Java heap size
# Add to gradle.properties:
org.gradle.jvmargs=-Xmx4096m
```

### Runtime Issues

**Issue:** "Network Error" on all requests
- Check backend is accessible from device
- Verify firewall allows connections
- Use device IP instead of localhost
- Check `.env` configuration

**Issue:** RFID scanner not working
- Ensure native app build (not H5)
- Check device-specific SDK integration
- Verify scanner permissions in AndroidManifest.xml
- Test with device manufacturer's sample app

**Issue:** App crashes on startup
- Check for missing native modules
- Verify target SDK version compatibility
- Review Android logcat for errors:
  ```powershell
  adb logcat | Select-String "Evolve"
  ```

---

## Advanced Configuration

### Custom App Icon
1. Prepare icon images (512x512, 1024x1024)
2. In HBuilderX: manifest.json → App Icons
3. Upload icon for Android/iOS
4. Rebuild app

### Custom Splash Screen
1. Create splash image (1242x2688 for iOS, various for Android)
2. In HBuilderX: manifest.json → Splash Screen
3. Upload and configure
4. Rebuild app

### Code Signing (Android)
```powershell
# Generate keystore
keytool -genkey -v -keystore evolve-wms.keystore -alias wms -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore evolve-wms.keystore app-release-unsigned.apk wms
```

### Performance Optimization
1. Enable ProGuard (minification):
   - manifest.json → App Permissions → Android → ProGuard
2. Reduce image sizes
3. Enable gzip compression on backend
4. Implement lazy loading for modules

---

## Deployment Strategy

### Development Phase
1. Use H5 build for rapid testing
2. Deploy to local network web server
3. Access from mobile browser: `http://192.168.x.x:8080`

### Testing Phase
1. Build debug APK with logging enabled
2. Distribute via email/cloud storage
3. Collect device logs for issues
4. Iterate based on feedback

### Production Phase
1. Build release APK with signing
2. Upload to:
   - Google Play Store (public distribution)
   - MDM solution (enterprise deployment)
   - Private server (direct download)
3. Implement version checking in app
4. Prepare rollback plan

---

## Maintenance

### Updating the App
1. Update version in `package.json`
2. Update version in `manifest.json`
3. Rebuild APK
4. Distribute new version
5. Consider implementing auto-update mechanism

### Monitoring
- Track app crashes via Firebase Crashlytics (optional)
- Monitor API response times
- Collect user feedback
- Review backend logs for errors

---

## Support Resources

- **uni-app Documentation:** https://uniapp.dcloud.net.cn/
- **HBuilderX Forum:** https://ask.dcloud.net.cn/
- **Vue.js Documentation:** https://vuejs.org/
- **Android Studio:** https://developer.android.com/studio

---

## Build Commands Reference

```powershell
# Development
npm run dev:h5                    # Web browser
npm run dev:app                   # Native app preview
npm run dev:app-android          # Android preview
npm run dev:app-ios              # iOS preview

# Production
npm run build:h5                 # Web build
npm run build:app                # Native app build
npm run build:app-android        # Android APK
npm run build:app-ios            # iOS IPA

# Testing
npm run build:h5:test            # Test environment build

# Cleanup
Remove-Item node_modules -Recurse -Force
Remove-Item dist -Recurse -Force
npm install
```

---

## Final Notes

1. **Always test on actual hardware** before production deployment
2. **Keep backend URL configurable** (don't hardcode in source)
3. **Implement error reporting** for production issues
4. **Document device-specific configurations** for your team
5. **Maintain changelog** for version tracking

**Estimated Build Times:**
- H5 Build: 1-2 minutes
- Android APK (Cloud): 5-10 minutes
- Android APK (Local): 10-15 minutes
- iOS IPA (Cloud): 10-15 minutes

Good luck with your deployment! 🚀
