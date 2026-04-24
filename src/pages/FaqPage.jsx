import { useState, useEffect } from 'react';
import './FaqPage.css';

const FAQ_DATA = [
  {
    q: "GienPhim là gì?",
    a: "GienPhim là một nền tảng website phi lợi nhuận, được thiết kế với giao diện chuẩn điện ảnh nhằm mang lại trải nghiệm tra cứu và xem phim tốt nhất. Toàn bộ dữ liệu của GienPhim được tự động lấy từ các API chia sẻ phim miễn phí trên Internet."
  },
  {
    q: "Tôi có phải trả phí để xem phim không?",
    a: "Không. GienPhim hoàn toàn miễn phí. Chúng tôi không yêu cầu bạn phải nạp thẻ, mua gói cước hay thanh toán bất kỳ khoản phí nào để xem nội dung trên website."
  },
  {
    q: "Tại sao một số phim không xem được?",
    a: "Vì GienPhim không trực tiếp lưu trữ video mà chỉ nhúng (embed) từ các máy chủ bên ngoài, đôi khi máy chủ nguồn có thể bị quá tải, bảo trì, hoặc tệp tin gốc đã bị xóa. Trong trường hợp này, bạn có thể thử chuyển sang 'Server' khác (nếu có) hoặc thông báo lỗi cho chúng tôi."
  },
  {
    q: "Tôi có thể tải phim của mình lên GienPhim không?",
    a: "Hoàn toàn KHÔNG. GienPhim không phải là nền tảng quản lý phim cộng đồng. Bạn chỉ có thể tạo tài khoản (Account) để lưu trữ Lịch sử xem phim và Danh sách phim yêu thích cá nhân."
  },
  {
    q: "Làm sao để xem phim trên Smart TV?",
    a: "GienPhim được thiết kế để tương thích với mọi kích thước màn hình. Bạn chỉ cần mở trình duyệt web (Browser) trên Smart TV của mình, truy cập vào đường dẫn của GienPhim và thưởng thức."
  },
  {
    q: "Tại sao tôi đang dùng iPhone và phải ấn Play 2 lần?",
    a: "Đây là một cơ chế bảo mật cốt lõi của hệ điều hành iOS (Apple). Safari cấm các đoạn video đến từ bên thứ 3 tự động phát nếu người dùng chưa tương tác trực tiếp vào khung video đó. Do đó, bạn cần ấn vào màn hình ngoài để loại bỏ giao diện che phủ, và ấn thêm 1 lần vào video để bắt đầu."
  },
  {
    q: "Làm sao để yêu cầu thêm phim mới?",
    a: "Bạn có thể truy cập vào trang Liên Hệ & Báo Lỗi, chọn mục 'Yêu cầu thêm phim mới' và điền tên phim bạn muốn. Chúng tôi sẽ cố gắng tìm kiếm nguồn phim và cập nhật sớm nhất có thể."
  }
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    document.title = "Câu Hỏi Thường Gặp - GienPhim";
  }, []);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1 className="faq-title">Câu hỏi thường gặp</h1>
        
        <ul className="faq-list">
          {FAQ_DATA.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggle(i)}>
                  {item.q}
                  <svg className="faq-icon" viewBox="0 0 24 24" width="36" height="36">
                    {/* A plus icon that rotates 45deg to become an X when open */}
                    <path fill="currentColor" d="M11 2v9H2v2h9v9h2v-9h9v-2h-9V2z" />
                  </svg>
                </button>
                <div className="faq-answer-wrapper">
                  <div className="faq-answer">
                    {item.a}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
