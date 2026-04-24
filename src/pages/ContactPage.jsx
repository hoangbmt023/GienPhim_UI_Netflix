import { useState, useEffect } from 'react';
import './ContactPage.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const GmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Góp ý chung',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Liên Hệ & Báo Lỗi - GienPhim";
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Góp ý chung', message: '' });
    }, 600);
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1 className="contact-title">Liên Hệ & Báo Lỗi</h1>
        <p className="contact-subtitle">Chúng tôi luôn lắng nghe để cải thiện trải nghiệm của bạn.</p>
      </div>

      <div className="contact-container">

        <div className="contact-socials">
          <a href="https://www.facebook.com/profile.php?id=61587108330332" target="_blank" rel="noreferrer" className="social-btn social-fb">
            <FacebookIcon />
            <span>Facebook</span>
          </a>
          <a href="https://www.instagram.com/gienphimmanager/" target="_blank" rel="noreferrer" className="social-btn social-ig">
            <InstagramIcon />
            <span>Instagram</span>
          </a>
          <a href="mailto:gienphimmanager@gmail.com" className="social-btn social-gm">
            <GmailIcon />
            <span>Email</span>
          </a>
        </div>

        <div className="contact-divider">
          <span>Hoặc gửi tin nhắn trực tiếp</span>
        </div>

        {submitted ? (
          <div className="contact-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h2>Cảm ơn bạn đã liên hệ!</h2>
            <p>Thông điệp của bạn đã được gửi đi. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.</p>
            <button className="contact-submit" onClick={() => setSubmitted(false)}>Gửi thêm tin nhắn</button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input type="text" id="name" name="name" required placeholder="Nhập tên của bạn" value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email liên hệ</label>
              <input type="email" id="email" name="email" required placeholder="example@domain.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Chủ đề</label>
              <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
                <option value="Góp ý chung">Góp ý chung</option>
                <option value="Báo lỗi phim">Báo lỗi phim không xem được</option>
                <option value="Báo lỗi phụ đề">Báo lỗi phụ đề / thuyết minh</option>
                <option value="Yêu cầu phim">Yêu cầu thêm phim mới</option>
                <option value="Bản quyền">Vấn đề bản quyền (Copyright)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Nội dung chi tiết</label>
              <textarea id="message" name="message" rows="5" required placeholder="Mô tả chi tiết lỗi hoặc nội dung bạn muốn gửi..." value={formData.message} onChange={handleChange}></textarea>
            </div>

            <button type="submit" className="contact-submit">Gửi Thông Điệp</button>
          </form>
        )}
      </div>
    </div>
  );
}
