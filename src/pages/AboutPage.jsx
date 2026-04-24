import { useEffect } from 'react';
import './AboutPage.css';

export default function AboutPage() {
  useEffect(() => {
    document.title = "Giới Thiệu - GienPhim";
  }, []);

  return (
    <div className="about-page">
      <div className="about-header">
        <h1 className="about-title">Về GienPhim</h1>
        <p className="about-subtitle">Nền tảng giải trí điện ảnh dành cho người yêu phim.</p>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2>1. Mục Đích Hoạt Động</h2>
          <p>
            GienPhim được phát triển như một không gian giải trí điện ảnh cá nhân, phi thương mại.
          </p>
          <ul>
            <li>Người dùng <strong>không thể</strong> tải lên (upload), quản lý hay thêm phim vào hệ thống. Mọi dữ liệu phim đều được tổng hợp tự động.</li>
            <li>Hệ thống chỉ cung cấp các tính năng cá nhân hóa trải nghiệm bao gồm: <strong>Tạo tài khoản (Account), Lưu lịch sử xem phim, và Thêm vào danh sách yêu thích</strong>.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>2. Tuyên Bố Miễn Trừ Trách Nhiệm (Disclaimer)</h2>
          <p>
            GienPhim <strong>không lưu trữ, không phát trực tiếp, và không phân phối</strong> bất kỳ tệp tin phương tiện (video, hình ảnh bản quyền) nào trên máy chủ của hệ thống.
          </p>
          <ul>
            <li>Toàn bộ dữ liệu, hình ảnh và liên kết phim được thu thập và tự động tổng hợp từ các nguồn công khai trên Internet (API bên thứ ba).</li>
            <li>Chúng tôi <strong>không chịu trách nhiệm pháp lý</strong> về nội dung, bản quyền, hoặc tính toàn vẹn của bất kỳ phương tiện truyền thông nào được liên kết hoặc hiển thị trên trang web này.</li>
            <li>Nếu bạn là chủ sở hữu bản quyền và phát hiện nội dung vi phạm, vui lòng liên hệ với nhà cung cấp API lưu trữ video gốc để gỡ bỏ. Khi nội dung gốc bị gỡ, GienPhim cũng sẽ tự động không còn hiển thị nội dung đó.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>3. Trải Nghiệm Người Dùng</h2>
          <p>
            Giao diện của GienPhim được chăm chút tỉ mỉ từ những chi tiết nhỏ nhất như thẻ phim nổi (floating pill), hệ thống lưới đáp ứng (responsive grid), cho đến các hoạt ảnh mượt mà. Chúng tôi tin rằng, trải nghiệm xem phim không chỉ nằm ở nội dung mà còn ở không gian thưởng thức.
          </p>
        </section>
      </div>
    </div>
  );
}
