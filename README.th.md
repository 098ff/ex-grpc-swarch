# ระบบจัดการเมนูร้านอาหารด้วย gRPC, Node.js, Express และ MongoDB

> **วิชา Software Architecture (gRPC Assignment)**  
> ผู้สอน: ผศ.ดร.หนึ่งวงศ์ ทวยเจริญ (Asst. Prof. Dr. Nuengwong Tuaycharoen)  
> ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย  
>
> 🌐 *Language versions:* [English (Default)](README.md) | **ภาษาไทย (Thai Version)**

---

## 📖 ภาพรวมระบบ (System Overview)

โปรเจกต์งานมอบหมายวิชา **Software Architecture (gRPC Assignment)** เป็นระบบจัดการเมนูร้านอาหารแบบ Full-Stack ตามสถาปัตยกรรม **3-Tier Distributed Architecture**:

1. **Presentation Layer (Tier 1)**: Web Browser แสดงผล UI ด้วย Bootstrap 4, Handlebars (`menu.hbs`) และ jQuery Modals
2. **Web Application & gRPC Client Layer (Tier 2)**: Express Web Server (Port `3000`) ทำหน้าที่รับคำขอจากหน้าเว็บ แล้วเรียก Remote Procedure Call (RPC) ไปยัง gRPC Server
3. **gRPC Service & Persistence Layer (Tier 3)**: gRPC Server (Port `30043`) ประมวลผล Business Logic และเชื่อมต่อจัดเก็บข้อมูลใน **MongoDB** ผ่าน **Mongoose ODM** แบบ `async/await`

```
+------------------+         HTTP (Forms / JSON)         +-------------------------------+
|   Web Browser    | <=================================> | Express Server (gRPC Client)  |
|  (Bootstrap/HBS) |         http://localhost:3000       |        port: 3000             |
+------------------+                                     +-------------------------------+
                                                                         |
                                                                         | gRPC over HTTP/2
                                                                         | (Protobuf)
                                                                         v
+------------------+         Mongoose / MongoDB Wire      +-------------------------------+
|  MongoDB Cluster | <==================================> |          gRPC Server          |
|  (Local / Atlas) |         mongodb://...                |          port: 30043          |
+------------------+                                      +-------------------------------+
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
gRPC-assignment/
├── .env                                       # Configuration & MongoDB Connection String
├── .env.example                               # ตัวอย่างไฟล์ตั้งค่า environment
├── config.env                                 # สำเนาไฟล์ env (ตามธรรมเนียมในสไลด์อาจารย์)
├── package.json                               # Dependencies & scripts
├── restaurant.proto                           # Protocol Buffer IDL สำหรับ RestaurantService
├── seed.js                                    # สคริปต์ Mock Data เริ่มต้นลง MongoDB
├── models/
│   └── Menu.js                                # Mongoose Schema สำหรับ Menu (name, price)
├── server/
│   └── server.js                              # gRPC Server ต่อ MongoDB ด้วย async/await
├── client/
│   ├── client.js                              # gRPC Client Stub เชื่อมต่อไปยัง Server
│   ├── index.js                               # Express Web Server + REST APIs
│   └── views/
│       └── menu.hbs                           # หน้าเว็บ Handlebars + Bootstrap 4
├── postman/
│   └── Restaurant_gRPC_Web.postman_collection.json # Postman Collection สำหรับทดสอบ/เดโม
├── README.md                                  # English Documentation (Main)
└── README.th.md                               # Thai Documentation (สำหรับอ่านอ้างอิง)
```

---

## ⚙️ ข้อกำหนดเบื้องต้น (Prerequisites)

1. **Node.js**: เวอร์ชัน 16+ ขึ้นไป (ทดสอบแล้วบน Node.js v18 - v24)
2. **MongoDB**:
   - **MongoDB Desktop / Compass (Local)**: URL คือ `mongodb://127.0.0.1:27017/restaurant`
   - หรือ **MongoDB Atlas (Cloud)**: ใส่ Connection String ที่ได้จาก cloud.mongodb.com เช่น `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority`

---

## 🚀 ขั้นตอนการติดตั้งและรันระบบ (Setup & Running)

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์แล้วรัน:
```bash
npm install
```

### 2. ตั้งค่าไฟล์ `.env` / `config.env`
ตรวจสอบไฟล์ `.env` (หรือ `config.env`) และระบุ Connection String ของ MongoDB:
```env
PORT=3000
GRPC_PORT=30043
DATABASE_URL=mongodb://127.0.0.1:27017/restaurant
```
*(หากใช้ MongoDB Atlas ให้เปลี่ยนค่า `DATABASE_URL` เป็น connection string ของคุณ)*

### 3. ใส่ข้อมูล Mock Data เริ่มต้น (Seed Data)
รันคำสั่งเพื่อสร้างข้อมูลเมนูเริ่มต้น 3 รายการตามสไลด์ (ต้มยำกุ้ง, ส้มตำ, ผัดไทย):
```bash
npm run seed
```

### 4. รันระบบ (เปิด 2 Terminal)

* **Terminal 1 (รัน gRPC Server)**:
  ```bash
  npm start
  ```
  *(จะแสดงข้อความ `Connected to Database` และ `Server running at http://127.0.0.1:30043`)*

* **Terminal 2 (รัน Express Web App / Client)**:
  ```bash
  npm run client
  ```
  *(จะแสดงข้อความ `Client Web Application running at http://localhost:3000`)*

### 5. เปิดใช้งานผ่านเว็บเบราว์เซอร์
เปิดเบราว์เซอร์ไปที่:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 การทดสอบผ่าน Postman (Postman Testing)

ในโฟลเดอร์ `postman/` มีไฟล์ **`Restaurant_gRPC_Web.postman_collection.json`**:
1. เปิดโปรแกรม Postman
2. กดปุ่ม **Import** แล้วเลือกไฟล์ `postman/Restaurant_gRPC_Web.postman_collection.json`
3. ใน Collection จะมี Request ครบถ้วนทั้ง 9 รายการ:
   - `1. Web UI - View Menu Page` (GET `http://localhost:3000/`)
   - `2. REST API - Get All Menu Items` (GET `http://localhost:3000/api/menu`)
   - `3. REST API - Create New Menu Item` (POST `http://localhost:3000/api/menu`)
   - `4. REST API - Get Menu Item By ID` (GET `http://localhost:3000/api/menu/:id`)
   - `5. REST API - Update Menu Item` (PUT `http://localhost:3000/api/menu/:id`)
   - `6. REST API - Delete Menu Item` (DELETE `http://localhost:3000/api/menu/:id`)
   - รวมถึงการจำลองส่ง Form Web UI (`/save`, `/update`, `/remove`)

---

## 📸 รายการตรวจสอบสำหรับส่งงาน (MCV Submission Checklist)

ตามข้อกำหนดในประกาศของอาจารย์ หากบันทึกเป็นคลิปวิดีโอ (ความยาว < 5 นาที) หรือ Capture ภาพหน้าจอ ให้เตรียมดังนี้:

| ลำดับ | รายการที่ต้องแคปเจอร์ / เดโม | รายละเอียด / จุดที่ต้องแสดง |
|:---:|:---|:---|
| 1 | **รูปการเพิ่มข้อมูล** | 1) กดปุ่ม *+ Add New Menu* กรอกชื่อและราคา แล้วกด Create บนหน้าเว็บ<br>2) เปิด MongoDB Compass ให้เห็น Document ใหม่ที่ถูกเพิ่ม |
| 2 | **รูปการแก้ไขข้อมูล** | 1) กดปุ่ม *Edit* ในแถวข้อมูล แก้ไขราคาหรือชื่อ แล้วกด Update บนหน้าเว็บ<br>2) เปิด MongoDB Compass ให้เห็นข้อมูลที่ถูกแก้ไข |
| 3 | **รูปการลบข้อมูล** | 1) กดปุ่ม *Remove* แล้วกดยืนยันการลบบนหน้าเว็บ<br>2) เปิด MongoDB Compass ให้เห็นว่ารายการนั้นถูกลบออกไปแล้ว |
| 4 | **โค้ดส่วน Model** | แคปหน้าต่างโค้ดไฟล์ `models/Menu.js` แสดง `menuSchema` ที่มี `name`, `price` |
| 5 | **ไฟล์ env** | แคปหน้าต่างโค้ดไฟล์ `.env` หรือ `config.env` แสดงตัวแปร `DATABASE_URL` ที่เชื่อมต่อ MongoDB |
| 6 | **โค้ดส่วน Server** | แคปหน้าต่างโค้ดไฟล์ `server/server.js` แสดงจุดเชื่อมต่อ `mongoose.connect()` และฟังก์ชัน gRPC service (`getAllMenu`, `get`, `insert`, `update`, `remove`) ที่ใช้ `async/await` |

---

## 💡 จุดเด่นทางเทคนิคที่พัฒนาเพิ่มเติม (Highlights)

1. **Protobuf `id` vs MongoDB `_id`**:
   - Schema ใน `models/Menu.js` ใช้ Virtual Getter `id` และใน `server/server.js` มีฟังก์ชัน formatting ทำให้แปลง `_id` เป็นสตริง `id` โดยคงโครงสร้าง `restaurant.proto` ไว้ตรงตามสไลด์ 100%
2. **Modern `@grpc/grpc-js`**:
   - ใช้ไลบรารีมาตรฐานปัจจุบันของ gRPC บน Node.js พร้อมฟังก์ชัน `server.bindAsync(...)` ทำให้รันได้ทั้งบน macOS (Apple Silicon / Intel), Linux และ Windows โดยไม่มีปัญหา Build Error
3. **การแก้ไข UI Bug ใน `menu.hbs`**:
   - แก้ไขจุดที่สไลด์เดิมตกค้าง `data-age` / `$('.age')` ให้เป็น `data-price` และ `$('.price')` อย่างสมบูรณ์ ทำให้เวลากดปุ่ม Edit ราคาจะถูกดึงขึ้นมาแสดงในช่องกรอกทันที
