# 🏃‍♂️ Background Task System - HealthApp

## 📋 **Overview**

Hệ thống background task cho phép ứng dụng tiếp tục theo dõi vận động (chạy bộ) ngay cả khi app bị minimize hoặc đóng. Bao gồm:

- **Location Tracking**: Theo dõi vị trí GPS trong background
- **Distance Calculation**: Tính quãng đường chính xác
- **Notification Timer**: Bộ đếm thời gian thực tế trên notification bar
- **Data Persistence**: Lưu/khôi phục data khi app restore

---

## 🚀 **Build & Test Instructions**

### **Bước 1: Build Development Build**

```bash
# Cài đặt expo-dev-client
npx expo install expo-dev-client

# Build development build cho Android
npx expo run:android

# Hoặc build cho iOS
npx expo run:ios
```

### **Bước 2: Install trên Device**

1. **Kết nối device** qua USB hoặc WiFi
2. **Enable Developer Options** và **USB Debugging**
3. **Install app** lên device thật
4. **Grant permissions** khi app yêu cầu

### **Bước 3: Test Background Tasks**

#### **Test 1: Basic Tracking**
1. **Mở app** và vào trang Activity
2. **Start tracking** - nhấn nút bắt đầu
3. **Kiểm tra notification bar** - sẽ thấy notification với thời gian
4. **Minimize app** - app vẫn tracking
5. **Di chuyển xung quanh** - location được track
6. **Restore app** - data được sync

#### **Test 2: Background Location**
1. **Start tracking** trong app
2. **Minimize app** hoàn toàn
3. **Đi bộ/chạy** khoảng 100-200m
4. **Mở lại app** - kiểm tra:
   - Thời gian tiếp tục đếm
   - Quãng đường được cập nhật
   - Vị trí được track trên map

#### **Test 3: Notification Timer**
1. **Start tracking** - notification hiển thị "00:00"
2. **Chờ 10 giây** - notification cập nhật "00:10"
3. **Chờ 20 giây** - notification cập nhật "00:20"
4. **Pause tracking** - notification hiển thị "⏸️ Tạm dừng"
5. **Resume tracking** - notification hiển thị "🏃‍♂️ Đang chạy"

---

## 🔧 **Technical Implementation**

### **Background Tasks:**

#### **1. Location Tracking**
```typescript
// utils/backgroundTracking.ts
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    // Track GPS location in background
    // Calculate distance between points
    // Store data in AsyncStorage
});
```

#### **2. Sensor Data**
```typescript
// Background sensor task
TaskManager.defineTask(BACKGROUND_SENSOR_TASK, async () => {
    // Maintain accelerometer data
    // Keep step count
    // Store sensor data
});
```

#### **3. Notification Timer**
```typescript
// utils/notificationService.ts
private startInternalTimer(): void {
    // Internal timer runs every 100ms
    // Updates notification every 1 second
    // Maintains accurate time tracking
}
```

### **Permissions Required:**

#### **Android Permissions:**
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

#### **App Configuration:**
```json
// app.json
"permissions": [
    "android.permission.ACTIVITY_RECOGNITION",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION", 
    "android.permission.FOREGROUND_SERVICE",
    "android.permission.FOREGROUND_SERVICE_LOCATION",
    "android.permission.WAKE_LOCK",
    "android.permission.POST_NOTIFICATIONS"
]
```

---

## 📱 **Expected Behavior**

### **✅ Hoạt động tốt:**
- **Location Tracking**: GPS hoạt động trong background
- **Distance Calculation**: Tính quãng đường chính xác
- **Notification Timer**: Bộ đếm thời gian thực tế
- **Data Sync**: Data được sync khi app restore
- **Pause/Resume**: Hoạt động đúng với trạng thái

### **⚠️ Có thể bị hạn chế:**
- **Accelerometer**: Một số device hạn chế sensor trong background
- **Step Counting**: Có thể không chính xác trong background
- **Battery Optimization**: Một số device có thể kill background tasks

### **❌ Không hoạt động:**
- **Expo Go**: Chỉ hoạt động trên development/production build
- **Simulator**: Cần device thật để test
- **iOS Simulator**: Background tasks bị hạn chế

---

## 🧪 **Testing Checklist**

### **Basic Functionality:**
- [ ] App build thành công trên device
- [ ] Permissions được grant đúng
- [ ] Start tracking hoạt động
- [ ] Notification hiển thị đúng
- [ ] Timer đếm chính xác

### **Background Tasks:**
- [ ] Minimize app - tracking vẫn hoạt động
- [ ] Di chuyển - location được track
- [ ] Notification cập nhật thời gian
- [ ] Restore app - data được sync
- [ ] Pause/Resume hoạt động đúng

### **Data Persistence:**
- [ ] Quãng đường được tính đúng
- [ ] Thời gian tracking chính xác
- [ ] Vị trí được lưu trên map
- [ ] Data không bị mất khi restore

### **Performance:**
- [ ] Battery usage hợp lý
- [ ] App không bị crash
- [ ] Memory usage ổn định
- [ ] Background tasks không bị kill

---

## 🐛 **Troubleshooting**

### **Issue 1: Background tasks không hoạt động**
**Cause**: Device battery optimization
**Solution**: 
- Vào Settings > Battery > App optimization
- Tắt optimization cho HealthApp
- Hoặc thêm vào whitelist

### **Issue 2: Location không được track**
**Cause**: Location permission bị từ chối
**Solution**:
- Vào Settings > Apps > HealthApp > Permissions
- Grant Location permission
- Chọn "Allow all the time"

### **Issue 3: Notification không hiển thị**
**Cause**: Notification permission
**Solution**:
- Vào Settings > Apps > HealthApp > Notifications
- Enable notifications
- Allow notification display

### **Issue 4: App bị kill trong background**
**Cause**: Android battery optimization
**Solution**:
- Vào Settings > Battery > Battery optimization
- Tìm HealthApp và chọn "Don't optimize"
- Hoặc thêm vào whitelist

---

## 📊 **Performance Monitoring**

### **Battery Usage:**
- **Normal**: 2-5% battery per hour
- **High**: >10% battery per hour (cần optimize)

### **Memory Usage:**
- **Normal**: 50-100MB
- **High**: >200MB (cần check memory leaks)

### **Background Tasks:**
- **Location**: Update mỗi 5s hoặc khi di chuyển >=10m
- **Notification**: Update mỗi 1s
- **Sensor**: Update mỗi 10s

---

## 🚨 **Important Notes**

1. **Chỉ test trên device thật** - không hoạt động trên Expo Go
2. **Cần development build** - không hoạt động trên Expo Go
3. **Permissions phải được grant** - location, notification, activity recognition
4. **Battery optimization** có thể kill background tasks
5. **iOS có hạn chế** background tasks hơn Android

---

## 📞 **Support**

Nếu gặp vấn đề:
1. **Check console logs** trong Metro bundler
2. **Verify permissions** trong device settings
3. **Test trên device khác** để so sánh
4. **Check battery optimization** settings
5. **Contact development team** với logs và device info

---

## 🎯 **Success Criteria**

Background task system được coi là thành công khi:
- ✅ App hoạt động trong background ít nhất 30 phút
- ✅ Location được track chính xác
- ✅ Notification timer đếm đúng
- ✅ Data được sync khi restore app
- ✅ Battery usage hợp lý (<10% per hour)
- ✅ Không bị crash hoặc memory leak

**Chúc bạn test thành công! 🚀**
