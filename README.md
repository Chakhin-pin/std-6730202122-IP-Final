# HR Manager & Salary Analytics

ผู้จัดทำ: **Chakhin Pinyo — 6730202122**

## โครงสร้าง

```text
Std6730202122IPFinal/
├── backend/       Express, MySQL employees, K-Means, API tests
└── frontend/      Expo Router, screens, context, components, lib, theme
```

## วิธีรัน

ใช้ Node.js 22.13 ขึ้นไป เปิด terminal สองหน้าต่างจากโฟลเดอร์นี้

Terminal 1:

```powershell
cd backend
npm install
# ตั้งค่า backend/.env ตาม backend/.env.example ก่อน
npm start
```

Terminal 2:

```powershell
cd frontend
npm install
npm run web
```

เปิด URL ที่ Expo แสดง เข้าใช้ด้วย **admin / password123**

มือถือ: ใช้ `npm start` ใน frontend แล้วสแกน QR ด้วย Expo Go ที่รองรับ SDK 57 โทรศัพท์กับคอมต้องอยู่ Wi-Fi เดียวกัน แอปจะใช้ host ของ Expo เพื่อหา API อัตโนมัติ หากต่อไม่ได้ ให้คัดลอก `frontend/.env.example` เป็น `frontend/.env.local` และเปลี่ยน IP เป็น IPv4 ของคอมจาก `ipconfig` แล้วเริ่ม Expo ใหม่ด้วย `npx expo start --clear` ต้องอนุญาต firewall สำหรับพอร์ต 3014 ด้วย

Android emulator: ตั้ง `EXPO_PUBLIC_API_URL=http://10.0.2.2:3014/api` กรณี API และ Metro อยู่คนละเครื่องหรือใช้ tunnel ให้กำหนด URL ที่โทรศัพท์เข้าถึงได้เอง

ข้อมูลพนักงานอ่านและบันทึกใน MySQL โดยตรง Restart backend แล้วข้อมูลยังอยู่ ไม่มีการเติมพนักงานตัวอย่างอัตโนมัติ และไม่แก้ตาราง products/users รีเฟรชหน้าเว็บจะต้อง Login ใหม่ token อยู่ใน React Context เท่านั้น

## ฟังก์ชันและ API

| Method | Path | การทำงาน |
|---|---|---|
| POST | /api/login | admin / password123 คืน mock-jwt-token |
| GET | /api/employees | รายชื่อพนักงาน |
| POST | /api/employees | เพิ่ม name, position, salary ที่เป็น number |
| PUT | /api/employees/:id/status | สลับ Active / On Leave |
| DELETE | /api/employees/:id | ลบพนักงาน |
| GET | /api/employees/salary-clusters | วิเคราะห์ K-Means k=3 |

ทุก endpoint พนักงานต้องส่ง `Authorization: Bearer mock-jwt-token` ตามระบบ mock ของข้อสอบ ข้อมูลไม่ครบ/เงินเดือนติดลบ/ไม่ใช่ตัวเลขคืน 400, ไม่ได้ login คืน 401, ไม่พบ ID คืน 404 เงินเดือน 0 ใช้งานได้ รองรับทศนิยมไม่เกิน 2 ตำแหน่ง และค่าสูงสุด 9,999,999,999.99 ตาม DECIMAL(12,2)

K-Means เริ่ม centroid จากค่าที่แตกต่างกันต่ำ/กลาง/สูง จัดสมาชิกเข้ากลุ่มที่ใกล้ที่สุดแล้วคำนวณค่าเฉลี่ยซ้ำจนคงที่หรือครบ 100 รอบ แสดง Tier 1–3 เรียงต่ำไปสูง หากไม่มีพนักงานหรือเงินเดือนต่างกันน้อยกว่า 3 ค่า กลุ่มที่ไม่มีสมาชิกจะแสดง `count: 0, centroid: null` โดยไม่หารด้วยศูนย์ หลังเพิ่ม/ลบ/สลับสถานะ แอปจะล้างผลวิเคราะห์เก่าเพื่อให้กดวิเคราะห์ข้อมูลปัจจุบันใหม่

ผลวิเคราะห์ใช้เฉพาะข้อมูลปัจจุบันใน employees หากมีเพียง Chakhin Pinyo เงินเดือน 45,000 จะได้ Tier 1: 45,000 (1 คน) และ Tier 2–3 ไม่มีข้อมูล

## ตรวจสอบ

```powershell
cd backend
npm test
```

```powershell
cd frontend
npm run typecheck
npm run export:web
```

ทดสอบหน้าจอ: login ผิดต้องแจ้งเตือน, login ถูกเข้า Dashboard, ส่งฟอร์มว่างไม่ได้, เพิ่มพนักงานแล้วรายการเปลี่ยนทันที, toggle สถานะ, Delete ต้องยืนยันก่อนยิง API และกดยกเลิกต้องไม่ลบ, Analyze ต้องมี loading แล้วแสดง 3 cards, ออกจากระบบแล้วเข้าหน้าหลักต้องกลับ Login

## ส่งงาน

ชื่อโปรเจกต์ตามที่ผู้ใช้กำหนด: `Std6730202122IPFinal`

สร้าง Public GitHub repository ชื่อเดียวกัน แล้ว push จากโฟลเดอร์นี้ จากนั้นส่ง URL ใน LMS ด้วยตนเอง โค้ดไม่รวม node_modules, .expo, dist และ .env.local

```powershell
git init
git add .
git commit -m "Build Chakhin Pinyo HR Manager and salary analytics"
git branch -M main
git remote add origin https://github.com/Chakhin-pin/std-6730202122-IP-Final.git
git push -u origin main
```

อ้างอิงเวอร์ชัน Expo ที่ใช้: https://docs.expo.dev/versions/v57.0.0/

## การเชื่อม MySQL

ไฟล์จริง `backend/.env` เก็บค่าจาก BOXBOX ไว้เฉพาะเครื่อง และไม่รวมใน Git/ZIP ใช้ไฟล์ตัวอย่างเป็นแบบ ต้องใส่ตัวแปรแต่ละตัวคนละบรรทัด ไม่เติมเครื่องหมาย backslash ท้ายบรรทัด

`DB_HOST=127.0.0.1` ใช้ได้เมื่อ MySQL อยู่เครื่องเดียวกับ backend หรือเปิด SSH tunnel ไว้แล้ว หาก backend อยู่บนเครื่องอาจารย์ให้รันที่เครื่องนั้น หากรันบนคอมส่วนตัวต้องใช้ DB host ที่อาจารย์อนุญาตให้เชื่อม หรือ tunnel ที่ถูกต้อง URL phpMyAdmin ไม่ใช่หลักฐานว่า MySQL เปิดให้ต่อจากภายนอก

backend ตรวจตาราง employees ก่อนเปิด API ถ้าเชื่อมไม่ได้จะหยุดพร้อม error code เช่น ECONNREFUSED ไม่สลับไปใช้ข้อมูลจำลองเงียบ ๆ ไม่ใช้ JWT_SECRET เพราะ Login ยังเป็น admin/password123 และ mock-jwt-token ตามโจทย์

`backend/schema.sql` เป็นโครงสร้างอ้างอิงและ SQL เพิ่ม Chakhin Pinyo แบบไม่เพิ่มซ้ำ ไม่ได้รันหรือเปลี่ยน DB ให้อัตโนมัติ

การทดสอบ `npm test` ใช้ store จำลองเฉพาะในไฟล์ทดสอบ ไม่มีการลบข้อมูลใน DB จริง การทดสอบเชื่อม DB จริงต้องเปิด MySQL/tunnel ก่อน `npm start`
