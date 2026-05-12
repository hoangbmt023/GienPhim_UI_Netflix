import { useState, useEffect } from "react";
import "./ContactPage.css";
import { useLang } from "@/utils/lang";
import { useAuth } from "@/contexts/AuthContext";
import { contactApi } from "@/services/contactApi";
import StatusModal from "@/components/StatusModal/StatusModal";

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
  const { t } = useLang();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: t.contact.form.subjects.general,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusModal, setStatusModal] = useState({ open: false, type: 'success', title: '', description: '' });

  useEffect(() => {
    document.title = `${t.contact.title} - GienPhim`;
  }, [t.contact.title]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      await contactApi.submitTicket(formData);
      setStatusModal({
        open: true,
        type: 'success',
        title: t.contact.successTitle,
        description: t.contact.successContent
      });
      setFormData({ 
        name: user?.name || "", 
        email: user?.email || "", 
        subject: t.contact.form.subjects.general, 
        message: "" 
      });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setFieldErrors(data.errors);
      } else {
        setStatusModal({
          open: true,
          type: 'error',
          title: 'Thất bại',
          description: data?.message || "Có lỗi xảy ra, vui lòng thử lại."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1 className="contact-title">{t.contact.title}</h1>
        <p className="contact-subtitle">{t.contact.subtitle}</p>
      </div>

      <div className="contact-container">
        <div className="contact-socials">
          <a
            href="https://www.facebook.com/profile.php?id=61587108330332"
            target="_blank"
            rel="noreferrer"
            className="social-btn social-fb"
          >
            <FacebookIcon />
            <span>Facebook</span>
          </a>
          <a
            href="https://www.instagram.com/gienphimmanager/"
            target="_blank"
            rel="noreferrer"
            className="social-btn social-ig"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </a>
          <a
            href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=gienphimmanager@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="social-btn social-gm"
          >
            <GmailIcon />
            <span>Email</span>
          </a>
        </div>

        <div className="contact-divider">
          <span>{t.contact.directMessage}</span>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t.contact.form.fullName}</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder={t.contact.form.namePlaceholder}
              value={formData.name}
              onChange={handleChange}
              className={fieldErrors.name ? 'input-error' : ''}
            />
            {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">{t.contact.form.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="example@domain.com"
              value={formData.email}
              onChange={handleChange}
              className={fieldErrors.email ? 'input-error' : ''}
            />
            {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subject">{t.contact.form.subject}</label>
            <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
              <option value={t.contact.form.subjects.general}>{t.contact.form.subjects.general}</option>
              <option value={t.contact.form.subjects.movieError}>{t.contact.form.subjects.movieError}</option>
              <option value={t.contact.form.subjects.subtitleError}>{t.contact.form.subjects.subtitleError}</option>
              <option value={t.contact.form.subjects.requestMovie}>{t.contact.form.subjects.requestMovie}</option>
              <option value={t.contact.form.subjects.copyright}>{t.contact.form.subjects.copyright}</option>
            </select>
            {fieldErrors.subject && <span className="field-error-msg">{fieldErrors.subject}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="message">{t.contact.form.message}</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              required
              placeholder={t.contact.form.messagePlaceholder}
              value={formData.message}
              onChange={handleChange}
              className={fieldErrors.message ? 'input-error' : ''}
            ></textarea>
            {fieldErrors.message && <span className="field-error-msg">{fieldErrors.message}</span>}
          </div>

          <button type="submit" className="contact-submit" disabled={loading}>
            {loading ? 'Đang gửi...' : t.contact.form.submit}
          </button>
        </form>
      </div>

      <StatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal(s => ({ ...s, open: false }))}
        type={statusModal.type}
        title={statusModal.title}
        description={statusModal.description}
      />
    </div>
  );
}
