# 📱 Hardware Scanner Quick Reference

## Stock-In Page Buttons

| Button | Color | Function | Status |
|--------|-------|----------|--------|
| **START HW** | 🟢 Green | Start hardware scanning | Active when green |
| **STOP HW** | 🔴 Red | Stop hardware scanning | Active when red |
| **QR SCAN** | 🟡 Yellow | Camera-based QR scan | Disabled during hardware scan |
| **STOCK IN** | 🔵 Blue | Update EPC status to INBOUND | Requires scanned items |
| **CLEAR** | ⚪ Gray | Clear all scanned tags | Always available |

---

## 🔄 Scanning Workflow

```
1. Fill DO Number ────> 2. Select Receiving Entry
                              │
                              ▼
                      3. Click "START HW"
                              │
                              ▼
                      4. Press Trigger Button
                              │
                              ▼
                      5. Hear Beep 📢
                              │
                              ▼
                      6. Item appears in table
                              │
                              ▼
                      7. Click "STOCK IN"
                              │
                              ▼
                      8. Confirm modal
                              │
                              ▼
                      9. ✅ Status updated to INBOUND
```

---

## 🎯 Scan Result Table

| # | EPC Code | SKU Code | Product Name |
|---|----------|----------|--------------|
| 1 | CC02ABCDEF01241025000001 | ABCDEF01 | Capacitor 100uF 16V |
| 2 | CC02ABCDEF01241025000002 | ABCDEF01 | Capacitor 100uF 16V |

**Color Legend**:
- 🟢 **Green Row**: EPC found in database with SKU match
- 🟡 **Yellow Row**: EPC scanned but no SKU match

---

## 🔊 Feedback Indicators

| Event | Audio | Visual | Duration |
|-------|-------|--------|----------|
| Scan Success | 📢 Beep | Toast: "Scanned: CC02..." | 800ms |
| Start Scan | - | Toast: "🔍 Hardware Scan Active" | 1500ms |
| Stop Scan | - | Toast: "⏹️ Hardware Scan Stopped" | 1500ms |
| Clear Tags | - | Toast: "🧹 Cleared all tags" | 1500ms |
| Stock-In Success | - | Modal: "✅ Stock In Successful" | Until dismissed |

---

## ⚠️ Common Issues

### No Beep Sound?
- Check device volume
- Ensure notification sound is enabled

### Duplicate Scans?
- Duplicate prevention: **1 second**
- Wait 1 second before rescanning same barcode

### Item Not in Table?
- Check if EPC exists in database
- Verify backend is running
- Ensure EPC has SKU code assigned

### Hardware Scan Not Starting?
- Check if app has camera/storage permissions
- Ensure device is AUTOID UTouch C
- Try restarting app

---

## 📋 Backend API Endpoints

```
GET  /api/epc/query-by-codes?tagCodes=CC02ABCDEF01241025000001
POST /api/epc/bulk-update-status { ids: [12], status: "INBOUND" }
```

---

## 🔐 EPC Status Flow

```
GENERATED → INBOUND → IN_STOCK → OUTBOUND → SOLD
    ⬆          ⬆
  Generate  Stock-In
   (Admin)  (Handheld)
```

**Current Implementation**: Stock-In updates status from `GENERATED` → `INBOUND`

---

## 💡 Tips & Tricks

1. **Scan Multiple Items**: Keep "START HW" active and scan continuously
2. **Review Before Confirm**: Check table before clicking "STOCK IN"
3. **Clear Mistakes**: Use "CLEAR" to remove all scanned items
4. **Fallback to Camera**: If hardware scan fails, use "QR SCAN" button
5. **Check Status**: Green rows = ready for stock-in, yellow rows = not in database

---

## 🎓 Training Script

**For New Users**:

> "Welcome to the WMS Handheld Stock-In feature!
> 
> 1. Enter your DO Number in the top field
> 2. Select the receiving entry from the dropdown
> 3. Press the green 'START HW' button
> 4. Point the scanner at a barcode and press the trigger button
> 5. Listen for the beep sound - that means it scanned successfully!
> 6. The item will appear in the table below
> 7. Scan all items in your delivery
> 8. When done, press the blue 'STOCK IN' button
> 9. Confirm the popup
> 10. Done! Your items are now marked as INBOUND
> 
> Remember: Green rows mean the item is in the system. Yellow rows mean it's not found.
> You can only stock-in green rows!"

---

**Last Updated**: October 29, 2025  
**Version**: 1.1.0  
**Device**: AUTOID UTouch C
