import { useEffect } from 'react';
import './AboutPage.css'; // Reusing about page styles for consistency

export default function TermsPage() {
  useEffect(() => {
    document.title = "Điều Khoản Sử Dụng - GienPhim";
  }, []);

  return (
    <div className="about-page">
      <div className="about-header">
        <h1 className="about-title">Điều Khoản Sử Dụng</h1>
        <p className="about-subtitle">Vui lòng đọc kỹ trước khi sử dụng dịch vụ của chúng tôi.</p>
      </div>

      <div className="about-container">
        <section className="about-section">
          <h2>1. Tuyên Bố Miễn Trừ Trách Nhiệm (Disclaimer)</h2>
          <p>
            GienPhim <strong>tuyệt đối không lưu trữ, không phát trực tiếp và không phân phối</strong> bất kỳ tệp tin phương tiện truyền thông (video, âm thanh, hình ảnh bản quyền) nào trên máy chủ của hệ thống.
          </p>
          <ul>
            <li>Toàn bộ nội dung phim, hình ảnh và liên kết video đều được tự động thu thập từ các nguồn (API) công khai do bên thứ ba cung cấp.</li>
            <li>Chúng tôi <strong>không chịu trách nhiệm pháp lý</strong> đối với bất kỳ khiếu nại nào liên quan đến nội dung, bản quyền, hay tính toàn vẹn của các dữ liệu được hiển thị trên trang web.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>2. Mục Đích Sử Dụng</h2>
          <p>
            Nền tảng này được xây dựng hoàn toàn vì mục đích học tập kỹ thuật lập trình và phục vụ nhu cầu tra cứu, giải trí <strong>cá nhân, phi thương mại</strong>.
          </p>
          <ul>
            <li>Người dùng có thể tạo tài khoản để quản lý <strong>danh sách yêu thích và lịch sử xem phim</strong> của cá nhân.</li>
            <li>Người dùng <strong>tuyệt đối không được cấp quyền</strong> để tải lên, chỉnh sửa hay xóa bất kỳ bộ phim nào trên hệ thống. GienPhim không phải là nền tảng chia sẻ dữ liệu cộng đồng.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>3. Bản Quyền (DMCA Policy)</h2>
          <p>
            Nếu bạn là chủ sở hữu bản quyền hợp pháp và phát hiện nội dung của mình bị vi phạm:
          </p>
          <ul>
            <li>Do GienPhim chỉ nhúng video (iframe embed), chúng tôi không có khả năng xóa tệp tin gốc. Bạn cần liên hệ trực tiếp với dịch vụ lưu trữ video (Video Hosting Provider) để yêu cầu họ gỡ bỏ.</li>
            <li>Khi tệp tin gốc bị xóa khỏi Internet, các liên kết và trình phát video trên GienPhim sẽ tự động mất tác dụng.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
