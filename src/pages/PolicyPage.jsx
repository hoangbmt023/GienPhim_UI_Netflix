import { useEffect } from 'react';
import './AboutPage.css';

export default function PolicyPage() {
  useEffect(() => {
    document.title = "Chính Sách Bảo Mật - GienPhim";
  }, []);

  return (
    <div className="about-page">
      <div className="about-header">
        <h1 className="about-title">Chính Sách Bảo Mật</h1>
        <p className="about-subtitle">Cách chúng tôi bảo vệ quyền riêng tư của bạn.</p>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2>1. Thu Thập Dữ Liệu Tài Khoản</h2>
          <p>
            Để cá nhân hóa trải nghiệm, GienPhim cho phép người dùng tạo tài khoản (Account).
          </p>
          <ul>
            <li>Tài khoản của bạn chỉ được sử dụng để <strong>lưu trữ lịch sử xem phim và danh sách phim yêu thích</strong>.</li>
            <li>Chúng tôi cam kết không thu thập các thông tin cá nhân nhạy cảm ngoài các thông tin cơ bản để duy trì tài khoản.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>2. Tính Năng & Quyền Hạn Người Dùng</h2>
          <p>
            Người dùng sử dụng tài khoản trên GienPhim <strong>không có quyền</strong> upload, đăng tải, thêm mới hay quản lý dữ liệu phim. 
            Mọi tính năng của tài khoản chỉ giới hạn ở việc xem và theo dõi nội dung.
          </p>
        </section>

        <section className="about-section">
          <h2>3. Cookie Bên Thứ Ba (Third-Party Cookies)</h2>
          <p>
            GienPhim không sử dụng Tracking Cookie riêng, nhưng trang web có nhúng các trình phát video (Video Players) từ bên thứ ba.
          </p>
          <ul>
            <li>Các nhà cung cấp này có thể thiết lập Cookie riêng để thu thập dữ liệu ẩn danh (lượt xem, quảng cáo).</li>
            <li>Việc sử dụng Cookie của họ tuân theo chính sách bảo mật riêng của nhà cung cấp đó, và nằm ngoài tầm kiểm soát của GienPhim.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>4. Bảo Mật Đường Truyền</h2>
          <p>
            Chúng tôi duy trì kết nối an toàn bằng giao thức HTTPS, giúp mã hóa luồng dữ liệu giữa trình duyệt của bạn và máy chủ GienPhim, ngăn chặn nguy cơ bị đánh cắp thông tin.
          </p>
        </section>
      </div>
    </div>
  );
}
