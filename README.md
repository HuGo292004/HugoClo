# 🛍️ HugoClo — Nền Tảng Thương Mại Điện Tử Thời Trang Fullstack

> **HugoClo** là nền tảng bán lẻ thời trang trực tuyến hiện đại với đầy đủ phân hệ cửa hàng cho khách hàng (**Storefront**) và cổng quản trị chuyên sâu (**Admin Portal**), tích hợp thanh toán số (**VNPay, MoMo**), trích xuất bảng màu tự động từ ảnh sản phẩm (**ColorThief**), tìm kiếm tiếng Việt thông minh không dấu, và tự động hóa tác vụ định kỳ (**Node-Cron**).

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## 📑 Mục Lục

1. [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
2. [Công Nghệ Sử Dụng (Tech Stack)](#-công-nghệ-sử-dụng-tech-stack)
3. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
4. [Yêu Cầu Hệ Thống (Prerequisites)](#-yêu-cầu-hệ-thống-prerequisites)
5. [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
   - [1. Clone Repository](#1-clone-repository)
   - [2. Cấu hình & Chạy Backend](#2-cấu-hình--khởi-chạy-backend)
   - [3. Cấu hình & Chạy Frontend](#3-cấu-hình--khởi-chạy-frontend)
6. [Cấu Hình Biến Môi Trường (.env)](#-cấu-hình-biến-môi-trường-env)
7. [Tài Khoản Mẫu Trải Nghiệm](#-tài-khoản-mẫu-trải-nghiệm)
8. [Hướng Dẫn Sử Dụng Các Phân Hệ Chính](#-hướng-dẫn-sử-dụng-các-phân-hệ-chính)
9. [Danh Sách RESTful API Endpoints](#-danh-sách-restful-api-endpoints)
10. [Tác Giả & Bản Quyền](#-tác-giả--bản-quyền)

---

## ✨ Tính Năng Nổi Bật

### 🛒 Dành Cho Khách Hàng (Storefront)
- **Trang chủ động (Dynamic Homepage):** Hero banner, mua sắm theo danh mục (**Nam**, **Nữ**, **Sale**), và khối **Sản phẩm nổi bật** hiển thị 6 sản phẩm ngẫu nhiên từ cơ sở dữ liệu.
- **Tìm kiếm tiếng Việt thông minh (Accent-Insensitive Search):** Tự động chuẩn hóa từ khóa; người dùng gõ `ao thun`, `áo thun`, `quan jean` hay `quần jean` đều tìm kiếm chính xác.
- **Bộ lọc & Phân loại đa năng:**
  - Lọc theo danh mục phụ (Áo, Quần, Giày, Phụ kiện).
  - Lọc khoảng giá linh hoạt bằng Slider.
  - Lọc theo kích thước (Size: S, M, L, XL, XXL) và mã màu sắc (Color Hex).
  - Lọc đánh giá tối thiểu (Rating 3★, 4★, 5★).
  - Sắp xếp: Mới nhất, Giá tăng/giảm, Bán chạy, Đánh giá cao.
- **Trang Sale chuyên biệt (`/sale`):** Bộ sưu tập giảm giá với giao diện tối giản, hiển thị phần trăm giảm giá và chỉ tải những sản phẩm đang áp dụng khuyến mãi (`isOnSale: true`).
- **Trải nghiệm tức thì (Optimistic UI):** Tương tác thêm/xóa Danh sách yêu thích (**Wishlist**) và Giỏ hàng (**Cart**) phản hồi giao diện tức thì không giật lag.
- **Tự động cuộn trang (Auto Scroll to Top):** Luôn đưa người dùng về đầu trang khi chuyển đổi qua lại giữa các danh mục hoặc vào xem chi tiết sản phẩm.
- **Thanh toán trực tuyến đa kênh:**
  - Thanh toán khi nhận hàng (**COD**).
  - Cổng thanh toán **VNPay** (Thẻ ATM nội địa, QR Pay, Quốc tế qua HMAC-SHA512).
  - Ví điện tử **MoMo** (Cổng thanh toán MoMo Sandbox qua HMAC-SHA256).
- **Quản lý đơn hàng & Đánh giá:** Xem lịch sử mua sắm, trạng thái đơn hàng thời gian thực, đánh giá số sao kèm bình luận và thống kê xếp hạng sản phẩm.

### ⚙️ Dành Cho Quản Trị Viên (Admin Portal)
- **Dashboard Thống Kê & Trực Quan Hóa (Recharts):**
  - Doanh thu tổng hợp, số lượng đơn hàng, lượng khách hàng đăng ký mới.
  - Biểu đồ doanh thu 7 ngày gần nhất và phân bố trạng thái đơn hàng.
- **Quản Lý Sản Phẩm Thông Minh (Smart Product Management):**
  - Thêm, sửa, xóa sản phẩm kèm upload nhiều ảnh lên **Cloudinary**.
  - **Trích xuất màu sắc tự động (ColorThief):** Tự động quét màu chủ đạo từ ảnh tải lên và quy đổi sang mã màu Hex & tên tiếng Việt chuẩn mực theo khoảng cách màu Euclid.
  - Quản lý kích thước, số lượng tồn kho từng size, giá gốc, giá khuyến mãi và trạng thái hiển thị.
- **Quản Lý Đơn Hàng Chuẩn Vòng Đời (Order FSM):**
  - Điều phối trạng thái: `Chờ xác nhận` ➔ `Đang xử lý` ➔ `Đang giao` ➔ `Đã giao` / `Đã hủy`.
  - Tự động trừ kho khi đơn đặt thành công và hoàn lại tồn kho khi đơn bị hủy.
  - **Node-Cron Background Task:** Tự động lên lịch lúc **02:00 sáng mỗi ngày** quét và lưu trữ (archive) các đơn hàng hủy đã tồn tại quá 30 ngày.
- **Quản Lý Người Dùng & Phân Quyền (RBAC):** Khóa/Mở tài khoản khách hàng, phân quyền vai trò `user` và `admin`.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Thành Phần | Công Nghệ / Thư Viện | Mô Tả |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19**, **Vite 8** | Single Page Application với tốc độ build siêu nhanh |
| **Routing & State** | **React Router v7**, **Context API** | Điều hướng bảo vệ Route, quản trị Giỏ hàng, Wishlist & Auth |
| **Styling & UI Kit** | **Tailwind CSS v4**, **Ant Design v6** | Thiết kế chuẩn Responsive, bảng biểu và form tương tác |
| **Biểu Đồ & Đồ Họa** | **Recharts**, **Lucide React**, **Ant Icons** | Dashboard trực quan hóa số liệu kinh doanh |
| **Xử Lý Ảnh** | **ColorThief** | Phân tích ảnh và trích xuất bảng màu tự động |
| **Backend Runtime** | **Node.js 20+**, **Express.js v5** | RESTful API Server kiến trúc MVC |
| **Cơ Sở Dữ Liệu** | **MongoDB Atlas**, **Mongoose v9** | CSDL NoSQL bán cấu trúc, Indexing & Aggregation Pipeline |
| **Authentication** | **JSON Web Token (JWT)**, **Bcrypt.js** | Xác thực phân quyền Role-Based Access Control (RBAC) |
| **Cloud Storage** | **Cloudinary**, **Multer** | Lưu trữ và tối ưu hóa hình ảnh sản phẩm/avatar trên mây |
| **Payment Gateways** | **VNPay Sandbox**, **MoMo API v2** | Mã hóa chữ ký điện tử HMAC-SHA256 / SHA512 & Webhook IPN |
| **Tự Động Hóa** | **Node-Cron** | Tiến trình chạy nền dọn dẹp và nén dữ liệu cũ |

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
HugoClo/
├── hugoclo-backend/               # Thư mục Backend (Node.js & Express API)
│   ├── src/
│   │   ├── config/                # Cấu hình Database MongoDB, Cloudinary
│   │   ├── controllers/           # Bộ điều khiển xử lý logic nghiệp vụ
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── cartController.js
│   │   │   └── ...
│   │   ├── cron/                  # Tiến trình Node-Cron tự động hóa
│   │   │   └── orderCron.js
│   │   ├── middleware/            # AuthGuard (JWT), Phân quyền Admin, Upload Multer
│   │   ├── models/                # Mongoose Models (User, Product, Order, Category, Review)
│   │   ├── routes/                # Khai báo các API Route
│   │   ├── services/              # Dịch vụ tích hợp bên thứ ba (VNPay, MoMo)
│   │   ├── utils/                 # Tiện ích (vietnameseUtils.js, colorUtils.js...)
│   │   └── app.js                 # Cấu hình Express App, Middlewares & CORS
│   ├── .env.example               # Mẫu file biến môi trường Backend
│   ├── server.js                  # Điểm khởi chạy Server
│   └── package.json
│
├── hugoclo-frontend/              # Thư mục Frontend (React & Vite)
│   ├── public/                    # Tài nguyên tĩnh, Favicon, SVG Icons
│   ├── src/
│   │   ├── api/                   # Cấu hình Axios Client & Interceptors tự động kèm JWT
│   │   ├── assets/                # Hình ảnh sản phẩm mặc định, banners, logo
│   │   ├── components/            # Components dùng chung (Header, Footer, ScrollToTop, RouteGuards)
│   │   ├── context/               # React Contexts (AuthContext, CartContext, WishlistContext)
│   │   ├── data/                  # Dữ liệu tĩnh dự phòng (categories, constants)
│   │   ├── pages/                 # Các màn hình giao diện
│   │   │   ├── AdminPage/         # Các màn hình Dashboard, Sản phẩm, Đơn hàng, Khách hàng
│   │   │   ├── AuthPage/          # Đăng nhập / Đăng ký
│   │   │   ├── CartPage/          # Giỏ hàng & Cập nhật số lượng
│   │   │   ├── CheckoutPage/      # Đặt hàng & Lựa chọn phương thức thanh toán
│   │   │   ├── HomePage/          # Trang chủ chính
│   │   │   ├── MenPage/           # Trang thời trang Nam
│   │   │   ├── WomenPage/         # Trang thời trang Nữ
│   │   │   ├── SalePage/          # Trang sản phẩm Flash Sale
│   │   │   ├── ProductsPage/      # Danh mục toàn bộ sản phẩm + Bộ lọc chuyên sâu
│   │   │   ├── ProductDetailPage/ # Chi tiết sản phẩm, chọn size, màu, đánh giá
│   │   │   ├── MyOrdersPage/      # Lịch sử và chi tiết đơn hàng cá nhân
│   │   │   ├── OrderSuccessPage/  # Thông báo thanh toán / đặt hàng thành công
│   │   │   └── ProfilePage/       # Hồ sơ cá nhân
│   │   ├── utils/                 # Thuật toán ColorThief & Euclidean Distance
│   │   ├── App.jsx                # Bộ định tuyến Router chính
│   │   └── main.jsx
│   ├── .env.example               # Mẫu file biến môi trường Frontend
│   ├── vite.config.js             # Cấu hình Vite & Tailwind CSS
│   └── package.json
│
├── PROJECT_CV_SUMMARY.md          # Tài liệu tóm tắt kỹ thuật & mẫu CV tiếng Anh/Việt
└── README.md                      # Hướng dẫn chi tiết sử dụng dự án
```

---

## 💻 Yêu Cầu Hệ Thống (Prerequisites)

Trước khi tiến hành cài đặt, đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
- **Node.js:** Phiên bản `>= 18.x` (khuyên dùng `20.x` hoặc mới hơn). Kiểm tra bằng lệnh:
  ```bash
  node -v
  ```
- **NPM** hoặc **Yarn / PNPM:** Đi kèm với Node.js.
- **MongoDB:** Cơ sở dữ liệu MongoDB cục bộ hoặc một tài khoản miễn phí trên [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- **Tài khoản Cloudinary:** Đăng ký miễn phí tại [Cloudinary.com](https://cloudinary.com/) để lấy `CLOUD_NAME`, `API_KEY`, `API_SECRET`.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Clone Repository
Mở Terminal / PowerShell và clone mã nguồn về máy:
```bash
git clone https://github.com/HuGo292004/HugoClo.git
cd HugoClo
```

---

### 2. Cấu Hình & Khởi Chạy Backend

1. **Di chuyển vào thư mục backend:**
   ```bash
   cd hugoclo-backend
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường:**
   Tạo file `.env` từ file mẫu `.env.example`:
   ```bash
   cp .env.example .env
   # Hoặc trên Windows PowerShell:
   copy .env.example .env
   ```
   Mở file `.env` và điền chuỗi kết nối MongoDB cùng thông tin Cloudinary, VNPay, MoMo (xem chi tiết tại [Mục Cấu Hình .env](#-cấu-hình-biến-môi-trường-env)).

4. **Khởi chạy Backend Server:**
   - Chế độ phát triển (tự động reload khi sửa code bằng `nodemon`):
     ```bash
     npm run dev
     ```
   - Chế độ thông thường:
     ```bash
     npm start
     ```
   Server backend sẽ chạy tại: `http://localhost:5000`

---

### 3. Cấu Hình & Khởi Chạy Frontend

Mở một cửa sổ Terminal mới (giữ Terminal backend tiếp tục chạy):

1. **Di chuyển vào thư mục frontend:**
   ```bash
   cd hugoclo-frontend
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Thiết lập biến môi trường:**
   Tạo file `.env` từ file mẫu `.env.example`:
   ```bash
   cp .env.example .env
   # Hoặc trên Windows PowerShell:
   copy .env.example .env
   ```
   Mặc định nội dung sẽ là:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Khởi chạy ứng dụng Frontend:**
   ```bash
   npm run dev
   ```
   Ứng dụng web sẽ chạy tại: `http://localhost:5173`

Mở trình duyệt và truy cập `http://localhost:5173` để bắt đầu trải nghiệm HugoClo!

---

## 🔑 Cấu Hình Biến Môi Trường (.env)

### 1. Backend (`hugoclo-backend/.env`)

```env
# Cổng chạy Backend API
PORT=5000

# Chuỗi kết nối MongoDB Atlas (hoặc mongodb://localhost:27017/hugoclo)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hugoclo?retryWrites=true&w=majority

# Khóa bí mật mã hóa JWT Token
JWT_SECRET=hugoclo_super_secret_jwt_key_2026

# Thông tin Cloudinary lưu trữ ảnh
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cấu hình Cổng thanh toán VNPay Sandbox
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/order-success

# Cấu hình Cổng thanh toán MoMo Sandbox
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_RETURN_URL=http://localhost:5173/order-success
MOMO_NOTIFY_URL=http://localhost:5000/api/orders/momo-ipn

# Địa chỉ Frontend được phép gọi API (CORS)
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend (`hugoclo-frontend/.env`)

```env
# Địa chỉ Base URL của Backend API
VITE_API_URL=http://localhost:5000/api
```

---

## 👤 Tài Khoản Mẫu Trải Nghiệm

### 1. Tài Khoản Đăng Nhập Hệ Thống

Bạn có thể tự tạo tài khoản mới ngay trên giao diện Đăng Ký `/auth` hoặc sử dụng các tài khoản mẫu sau:

| Loại Tài Khoản | Email | Mật Khẩu | Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `giaovinhhung@gmail.com` | `123456` | Toàn quyền truy cập Admin Dashboard (`/admin`), quản lý sản phẩm, đơn hàng, khách hàng |
| **Khách hàng (User)** | `nguyenvana@gmail.com` | `giaovinhhung2009` | Mua sắm, giỏ hàng, thanh toán, đánh giá sản phẩm |

> 💡 **Mẹo:** Để nâng cấp một tài khoản thông thường thành `admin`, bạn có thể đổi trường `role` của user đó trong MongoDB Collection `users` thành `"admin"`.

---

### 2. Thông Tin Thẻ Test Thanh Toán Sandbox (VNPay & MoMo)

Khi đặt hàng và chọn thanh toán trực tuyến qua môi trường thử nghiệm (Sandbox), bạn có thể sử dụng các thông tin thẻ test dưới đây:

#### 💳 Cổng Thanh Toán VNPay Sandbox
- **Ngân hàng:** `NCB`
- **Số thẻ:** `9704198526191432198`
- **Tên chủ thẻ:** `NGUYEN VAN A`
- **Ngày phát hành:** `07/15`
- **Mật khẩu OTP:** `123456`

#### 📱 Cổng Thanh Toán MoMo Sandbox
- **Tên chủ thẻ:** `NGUYEN VAN A`
- **Số thẻ:** `9704 0000 0000 0018`
- **Ngày hết hạn:** `03/07`
- **Mật khẩu OTP:** Nhập bất kỳ (ví dụ: `123456` hoặc mã hệ thống hiển thị)

---

## 📖 Hướng Dẫn Sử Dụng Các Phân Hệ Chính

### 1. Luồng Mua Sắm Dành Cho Khách Hàng
1. **Tìm kiếm & Lọc:**
   - Nhập từ khóa tại thanh tìm kiếm ở Header (hỗ trợ gõ không dấu như `ao thun`, `vay`, `blazer`).
   - Click chọn các phân loại: **Nam** (`/men`), **Nữ** (`/women`), **Sale** (`/sale`) hoặc **Sản Phẩm** (`/products`).
2. **Chi tiết sản phẩm:**
   - Xem bộ sưu tập hình ảnh, chọn màu sắc (Color Palette) và kích cỡ (Size: S, M, L, XL).
   - Bấm **Thêm vào giỏ hàng** hoặc **Thêm vào yêu thích** (Wishlist).
3. **Thanh toán:**
   - Vào Giỏ hàng (`/cart`) kiểm tra số lượng và mã giảm giá (nếu có).
   - Nhập thông tin người nhận hàng tại trang Checkout (`/checkout`).
   - Lựa chọn phương thức:
     - **COD:** Nhận hàng thanh toán tiền mặt.
     - **VNPay Sandbox:** Chuyển hướng sang cổng VNPAY (chọn thẻ Demo NCB để test).
     - **MoMo Sandbox:** Quét mã QR qua ứng dụng MoMo Developer Test.
4. **Theo dõi đơn hàng:**
   - Truy cập **Đơn hàng của tôi** (`/my-orders`) để xem trạng thái xử lý đơn theo thời gian thực.

### 2. Luồng Quản Trị Viên (Admin Portal)
1. Đăng nhập bằng tài khoản Admin, truy cập đường dẫn `/admin`.
2. **Thống kê:** Quan sát biểu đồ biến động doanh thu và tổng quan đơn hàng trong tuần.
3. **Quản lý sản phẩm (`/admin/products`):**
   - Nhấn **Thêm sản phẩm mới**.
   - Tải ảnh sản phẩm lên ➔ Hệ thống tự động kích hoạt **ColorThief** nhận diện màu và đề xuất mã Hex + tên màu tiếng Việt.
   - Điền thông tin giá bán, kích cỡ, danh mục và ấn lưu để cập nhật lên Cloudinary & MongoDB.
4. **Xử lý đơn hàng (`/admin/orders`):**
   - Xem chi tiết từng đơn hàng, địa chỉ giao hàng và thông tin thanh toán.
   - Cập nhật tiến độ đơn: Xác nhận ➔ Đang giao ➔ Hoàn tất (hoặc Hủy đơn có hoàn tồn kho).

---

## 📡 Danh Sách RESTful API Endpoints

### 🔐 Xác Thực & Người Dùng (`/api/auth` & `/api/user`)
- `POST /api/auth/register` — Đăng ký tài khoản mới.
- `POST /api/auth/login` — Đăng nhập và nhận JWT token.
- `GET /api/user/profile` — Lấy thông tin tài khoản hiện tại (Cần Bearer Token).
- `PUT /api/user/profile` — Cập nhật hồ sơ & đổi mật khẩu.
- `GET /api/user/all` — Danh sách người dùng (Chỉ dành cho Admin).

### 👗 Sản Phẩm (`/api/products`)
- `GET /api/products` — Lấy danh sách sản phẩm (có phân trang, tìm kiếm không dấu `keyword`, lọc `gender`, `isOnSale`, `minPrice`, `maxPrice`, `sort`).
- `GET /api/products/:id` — Chi tiết sản phẩm theo ID kèm rating breakdown.
- `POST /api/products` — Tạo sản phẩm mới kèm upload ảnh (Admin).
- `PUT /api/products/:id` — Chỉnh sửa sản phẩm (Admin).
- `DELETE /api/products/:id` — Xóa sản phẩm (Admin).

### ⭐ Đánh Giá & Bình Luận (`/api/products/:id/reviews`)
- `GET /api/products/:id/reviews` — Lấy danh sách review của sản phẩm.
- `POST /api/products/:id/reviews` — Viết đánh giá số sao và nhận xét (User).
- `PUT /api/products/:id/reviews/:reviewId/helpful` — Đánh dấu đánh giá hữu ích.

### 📦 Đơn Hàng & Thanh Toán (`/api/orders`)
- `POST /api/orders` — Tạo đơn hàng mới (COD / VNPay / MoMo).
- `GET /api/orders/my-orders` — Lịch sử đơn hàng của khách hàng hiện tại.
- `GET /api/orders` — Toàn bộ danh sách đơn hàng toàn sàn (Admin).
- `PUT /api/orders/:id/status` — Cập nhật trạng thái đơn hàng (Admin).
- `GET /api/orders/vnpay-return` — Xử lý kết quả trả về từ cổng VNPay.
- `POST /api/orders/momo-ipn` — Webhook nhận thông báo giao dịch tức thì từ MoMo.

---

## 👨‍💻 Tác Giả & Bản Quyền

- **Họ và tên:** **Giao Vĩnh Hưng**
- **GitHub:** [@HuGo292004](https://github.com/HuGo292004)
- **Repository:** [https://github.com/HuGo292004/HugoClo](https://github.com/HuGo292004/HugoClo)
- **Dự án được xây dựng với mục đích học tập và phục vụ nghiên cứu phát triển phần mềm.**

*Chúc bạn có những trải nghiệm tuyệt vời cùng HugoClo! Mọi thắc mắc hoặc đóng góp ý kiến vui lòng tạo Issue trên GitHub repository.*

