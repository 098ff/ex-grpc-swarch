# Restaurant Management System with gRPC, Node.js, Express & MongoDB

> **Software Architecture Course (gRPC Assignment)**  
> Instructor: Asst. Prof. Dr. Nuengwong Tuaycharoen  
> Department of Computer Engineering, Faculty of Engineering, Chulalongkorn University  
>
> 🌐 *Language versions:* **English (Default)** | [ภาษาไทย (Thai Version)](README.th.md)

---

## 📖 Overview

This project implements a full-stack **Restaurant Menu Management (CRUD)** application following a **3-Tier Distributed Architecture**:

1. **Presentation Layer (Tier 1)**: Web Browser rendering responsive UI using Bootstrap 4, Handlebars (`menu.hbs`), and jQuery Modals.
2. **Web Application & gRPC Client Layer (Tier 2)**: Express.js web server running on port `3000`. It handles HTTP form requests from the browser and communicates with the backend via gRPC Remote Procedure Calls (RPC).
3. **gRPC Service & Persistence Layer (Tier 3)**: Standalone gRPC server running on port `30043`. It executes business logic and interacts with **MongoDB** via **Mongoose ODM** using `async/await`.

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

## 📁 Project Structure

```text
gRPC-assignment/
├── .env                                       # Environment configuration (DATABASE_URL, ports)
├── .env.example                               # Example environment template
├── config.env                                 # Alternate env file (following lecture convention)
├── package.json                               # Dependencies & npm scripts
├── restaurant.proto                           # Protocol Buffer IDL for RestaurantService
├── seed.js                                    # Database seeder for initial mock dishes
├── models/
│   └── Menu.js                                # Mongoose Schema for Menu (name, price)
├── server/
│   └── server.js                              # gRPC Server connected to MongoDB via async/await
├── client/
│   ├── client.js                              # gRPC Client Stub communicating with Server
│   ├── index.js                               # Express Web Server & REST API endpoints
│   └── views/
│       └── menu.hbs                           # Handlebars template with Bootstrap 4 & Modals
├── postman/
│   └── Restaurant_gRPC_Web.postman_collection.json # Postman Collection for testing & demo
├── README.md                                  # English Documentation (Main)
└── README.th.md                               # Thai Documentation (สำหรับอ่านอ้างอิง)
```

---

## ⚙️ Prerequisites

1. **Node.js**: Version 16+ (tested on Node.js v18 - v24)
2. **MongoDB**:
   - **Local MongoDB**: MongoDB Community Server or MongoDB Desktop/Compass running on `mongodb://127.0.0.1:27017/restaurant`.
   - **Cloud MongoDB (MongoDB Atlas)**: A free cluster on [mongodb.com](https://www.mongodb.com/cloud/atlas) with a standard URI connection string.

---

## 🚀 Installation & Setup

### 1. Install Dependencies
In the root directory, run:
```bash
npm install
```

### 2. Configure Environment Variables
Verify or edit `.env` (or `config.env`):
```env
PORT=3000
GRPC_PORT=30043
DATABASE_URL=mongodb://127.0.0.1:27017/restaurant
```
> **Note:** If using MongoDB Atlas, replace `DATABASE_URL` with your Atlas connection string, for example:  
> `DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/restaurant?retryWrites=true&w=majority`

### 3. Seed Initial Mock Data
Populate MongoDB with the 3 initial sample dishes from the lecture slide (Tomyam Gung, Somtam, Pad-Thai):
```bash
npm run seed
```

---

## 🏃 Running the Application

Running the application requires two processes:

### Terminal 1: Start gRPC Server
```bash
npm start
```
*Expected output:*
```text
Connected to Database: mongodb://127.0.0.1:27017/restaurant
Server running at http://127.0.0.1:30043
```

### Terminal 2: Start Express Client Web Application
```bash
npm run client
```
*Expected output:*
```text
Client Web Application running at http://localhost:3000
```

### Accessing the Web UI
Open your browser and navigate to:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testing with Postman

A complete Postman collection is provided in `postman/Restaurant_gRPC_Web.postman_collection.json`.

1. Open **Postman**.
2. Click **Import** and select `postman/Restaurant_gRPC_Web.postman_collection.json`.
3. The collection contains 9 pre-configured requests:
   - `1. Web UI - View Menu Page` (GET `http://localhost:3000/`)
   - `2. REST API - Get All Menu Items` (GET `http://localhost:3000/api/menu`)
   - `3. REST API - Create New Menu Item` (POST `http://localhost:3000/api/menu`)
   - `4. REST API - Get Menu Item By ID` (GET `http://localhost:3000/api/menu/:id`)
   - `5. REST API - Update Menu Item` (PUT `http://localhost:3000/api/menu/:id`)
   - `6. REST API - Delete Menu Item` (DELETE `http://localhost:3000/api/menu/:id`)
   - `7. Web Form - Save New Menu Item` (Form POST simulation)
   - `8. Web Form - Update Menu Item` (Form POST simulation)
   - `9. Web Form - Remove Menu Item` (Form POST simulation)

---

## 📸 Assignment Submission Checklist (MCV Guidelines)

If recording a video (< 5 minutes) or capturing screenshots for submission, make sure to cover the following:

| # | Item Required | Description & Evidence to Capture |
|:---:|:---|:---|
| 1 | **Create (Add Data)** | 1) Click **+ Add New Menu** on the web page, fill in Name & Price, and click **Create**.<br>2) Show the newly inserted document inside MongoDB Compass / Shell. |
| 2 | **Update (Edit Data)** | 1) Click the purple **Edit** button on a menu item row, change Name or Price, and click **Update**.<br>2) Show the updated document reflected in MongoDB Compass / Shell. |
| 3 | **Delete (Remove Data)** | 1) Click the red **Remove** button on a row, and confirm removal.<br>2) Show that the document was removed and remaining documents in MongoDB Compass / Shell. |
| 4 | **Model Code** | Screenshot of `models/Menu.js` showing `menuSchema` with `name` and `price`. |
| 5 | **Environment File** | Screenshot of `.env` or `config.env` displaying the `DATABASE_URL` connection string. |
| 6 | **Server Code** | Screenshot of `server/server.js` showing `mongoose.connect()` and the gRPC service functions implementing `async/await`. |

---

## 💡 Technical Highlights & Fixes

1. **Protocol Buffers Compliance & `_id` vs `id` Resolution**:
   - The contract in `restaurant.proto` retains `string id = 1;` exactly as specified in Lecture 6, slide 34.
   - In `models/Menu.js`, a virtual getter `id` is configured.
   - In `server/server.js`, a formatting utility `formatMenuItem` maps MongoDB's `_id.toString()` to protobuf's `id`, guaranteeing 100% interoperability without altering client or proto schemas.
2. **Modern `@grpc/grpc-js`**:
   - Uses modern pure-JavaScript `@grpc/grpc-js` and `server.bindAsync(...)`, avoiding deprecated C++ native addon builds on macOS and newer Node.js versions.
3. **UI Bug Fix in `menu.hbs`**:
   - Fixed leftover attributes from slide 44 & 49 where the edit modal button had `data-age` instead of `data-price`.
   - Updated the jQuery handler to populate `.price` inputs so editing prices functions accurately.
