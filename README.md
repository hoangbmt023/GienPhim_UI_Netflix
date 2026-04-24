# GienPhim - Nền Tảng Xem Phim Trực Tuyến (Netflix Clone)

GienPhim là một dự án giao diện web xem phim trực tuyến được xây dựng bằng **ReactJS** và **Vite**, lấy cảm hứng thiết kế từ **Netflix**. 
Dự án sử dụng API cung cấp dữ liệu phim tự động từ hệ thống OPhim để hiển thị hàng ngàn bộ phim lẻ, phim bộ, anime hoàn toàn miễn phí.

## ✨ Tính Năng Nổi Bật

- **Giao diện Netflix-style:** Trải nghiệm người dùng mượt mà, tối giản, sang trọng với tông màu tối (Dark theme) làm chủ đạo.
- **Responsive Design:** Hoạt động hoàn hảo trên mọi thiết bị: Mobile, Tablet, Desktop và Smart TV.
- **Lọc & Tìm kiếm phim:** 
  - Tìm kiếm phim theo tên nhanh chóng với Search Dropdown live.
  - Lọc phim theo Quốc Gia, Thể Loại, Năm Phát Hành, Loại phim.
- **Trang Chi Tiết & Xem Phim:**
  - Hiển thị đầy đủ thông tin: Điểm đánh giá, diễn viên, nội dung, trailer.
  - Tích hợp trình phát video mượt mà, hỗ trợ chọn tập phim, chọn server.
- **Lưu trữ Cá Nhân (Local Storage):**
  - Lưu **Lịch sử xem phim** (Tiếp tục xem tập đang xem dở).
  - Thêm phim vào **Danh sách yêu thích**.
- **Trung Tâm Hỗ Trợ:** Giao diện hỗ trợ chuẩn Facebook với các trang Giới Thiệu, FAQ, Điều Khoản, Chính Sách Bảo Mật và Liên Hệ.

## 🛠 Công Nghệ Sử Dụng

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** React Router DOM (v6)
- **Styling:** Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
- **Data Fetching:** Fetch API kết hợp với OPhim API
- **Icons:** Inline SVG Icons tự thiết kế, tối ưu tốc độ tải trang.

## 🚀 Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống
- Node.js bản 18.x trở lên.
- npm hoặc yarn.

### 2. Cài đặt và chạy dự án

Clone dự án về máy:
```bash
git clone https://github.com/hoangbmt023/GienPhim_UI_Netflix.git
cd GienPhim_UI_Netflix
```

Cài đặt các thư viện cần thiết:
```bash
npm install
```

Chạy server phát triển (Development):
```bash
npm run dev
```

Mở trình duyệt và truy cập vào địa chỉ: `http://localhost:5173`

### 3. Build để đưa lên Production
```bash
npm run build
```
Thư mục `dist/` sẽ được tạo ra chứa các file tĩnh đã tối ưu sẵn sàng để deploy lên Vercel, Netlify, hoặc VPS.

## 📁 Cấu Trúc Thư Mục

```text
src/
├── components/       # Các UI Component dùng chung (Header, Footer, MovieCard, HeroBanner...)
├── pages/            # Các trang giao diện chính (Home, Browse, Watch, Detail, Contact...)
├── routes/           # Định tuyến ứng dụng (AppRoutes)
├── services/         # Nơi chứa các hàm gọi API (ophimApi.js)
├── utils/            # Các hàm hỗ trợ (Format date, format title...)
├── index.css         # Reset CSS và khai báo biến toàn cục (Global Variables)
└── App.jsx           # Component gốc của ứng dụng
```

## 📜 Nguồn Dữ Liệu
Dự án sử dụng hệ thống API của OPhim (Bao gồm danh sách phim cập nhật liên tục, chi tiết phim, và link m3u8 stream). 
*Lưu ý: Dự án không tự lưu trữ bất kỳ file video nào trên máy chủ.*

## 📝 License
Dự án được xây dựng vì mục đích học tập và giải trí cá nhân, phi thương mại.
