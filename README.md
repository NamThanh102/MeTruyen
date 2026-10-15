# MeTruyen - Nền Tảng Đọc Truyện Tranh Trực Tuyến

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-black.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248.svg)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)](https://tailwindcss.com/)

**MeTruyen** là nền tảng web đọc truyện và xuất bản truyện tranh số hóa hiện đại, được xây dựng trên nền tảng **MERN Stack** (MongoDB, Express.js, React, Node.js) áp dụng mô hình kiến trúc 3 tầng **3-Tier Layered Architecture** (Controller - Service - Model) cùng chuẩn mã nguồn **Native ES Modules (ESM)**. 

Hệ thống đem lại trải nghiệm đọc truyện mượt mà với giao diện Dark Theme tối ưu, cơ chế stream ảnh tối ưu hóa băng thông qua Cloudinary CDN, theo dõi lượt đọc nguyên tử (Atomic Metrics Tracking), bảo mật phân quyền Role-Based Access Control (RBAC) và bộ công cụ quản trị (Admin Dashboard) toàn diện.

---

## Công Nghệ Sử Dụng (Tech Stack)

| Phân Vùng | Công Nghệ & Thư Viện |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS, Zustand, Axios, React Router v6, React Dropzone, React Icons |
| **Backend** | Node.js (v20+), Express.js 5, Mongoose 9, JWT, BcryptJS, Multer, Helmet, Express Rate Limit |
| **Cơ Sở Dữ Liệu** | MongoDB 7.0 (NoSQL) với Compound Indexing & Aggregation Pipelines |
| **Cloud Storage** | Cloudinary Media API (Tự động chuyển đổi định dạng WebP, tối ưu kích thước ảnh) |

---

## Cấu Trúc Thư Mục (Directory Structure)

```text
MeTruyen/
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình kết nối Database, Cloudinary CDN
│   │   ├── controllers/     # Tầng tiếp nhận HTTP Request & trả Response (Thin Controllers)
│   │   ├── services/        # Tầng xử lý nghiệp vụ chính (Auth, Comic, Chapter, User, Category, Comment)
│   │   ├── middlewares/     # Middleware xác thực JWT, phân quyền RBAC, upload ảnh, bắt lỗi tập trung
│   │   ├── models/          # Mongoose Schemas & hooks (User, Comic, Chapter, Comment, Payment)
│   │   ├── routes/          # Định nghĩa danh mục RESTful API Endpoints
│   │   ├── utils/           # Tiện ích bổ trợ (JWT helper, async wrapper)
│   │   └── server.js        # File khởi động server Express và pipeline middleware bảo mật
│   ├── seed.js              # Script khởi tạo 20 truyện, 100 chương, 80 bình luận mẫu
│   └── package.json         # Khai báo dependencies và "type": "module"
├── frontend/
│   ├── src/
│   │   ├── components/      # Các component tái sử dụng (Layout, ComicCard, CommentSection, AuthRoute)
│   │   ├── pages/           # Màn hình giao diện (Trang chủ, Trình đọc, Khám phá, Cá nhân, Admin)
│   │   ├── services/        # Axios client interceptors tự động đính kèm token & điều hướng 401
│   │   ├── store/           # Quản lý trạng thái phiên đăng nhập toàn cục với Zustand
│   │   └── App.jsx          # Cấu hình React Router v6
│   └── vite.config.js       # Cấu hình Vite Dev Server và proxy chuyển hướng /api
└── README.md
```

---

## Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường
- [Node.js](https://nodejs.org/) phiên bản 18.x trở lên
- [MongoDB](https://www.mongodb.com/) phiên bản 6.x trở lên đang chạy tại máy cục bộ (port 27017)

### 1. Tải Mã Nguồn

```bash
git clone https://github.com/NamThanh102/MeTruyen.git
cd MeTruyen
```

### 2. Khởi Động Backend

Mã nguồn đã tích hợp sẵn cơ chế **Zero-Config Fallback** (tự động nhận diện MongoDB local và JWT secret mặc định, không bắt buộc phải tạo file cấu hình thủ công để chạy thử):

```bash
cd backend

# Cài đặt thư viện
npm install

# Nạp dữ liệu mẫu (5 Tài khoản, 16 Thể loại, 20 Bộ truyện, 100 Chương, 80 Bình luận)
npm run seed

# Khởi chạy server ở chế độ phát triển
npm run dev
```
Backend sẽ chạy tại địa chỉ: `http://localhost:5000` *(kiểm tra sức khỏe hệ thống tại: `http://localhost:5000/api/health`)*.

### 3. Khởi Động Frontend

Mở một cửa sổ dòng lệnh (terminal) mới:

```bash
cd frontend

# Cài đặt thư viện
npm install

# Khởi chạy giao diện React
npm run dev
```
Frontend sẽ chạy tại địa chỉ: `http://localhost:3000`.

---

## Tài Khoản Trải Nghiệm Mẫu (Sau Khi Chạy Seed)

| Vai Trò (Role) | Tên Đăng Nhập | Email | Mật Khẩu | Quyền Hạn |
|---|---|---|---|---|
| **Quản trị viên (Admin)** | `admin` | `admin@metruyen.com` | `admin123` | Toàn quyền quản trị nội dung, upload truyện, duyệt điểm |
| **Thành viên Demo (VIP)** | `demo` | `demo@metruyen.com` | `demo123` | Có điểm M-Point, gói VIP, đã lưu sẵn tủ sách & lịch sử |
| **Độc giả thường** | `reader` | `reader@metruyen.com` | `reader123` | Tài khoản độc giả thông thường |

---
