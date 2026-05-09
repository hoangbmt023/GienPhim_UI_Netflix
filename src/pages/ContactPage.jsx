import { useState, useEffect } from 'react';
import './ContactPage.css';
import { useLang } from '@/utils/lang';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: t.contact.form.subjects.general,
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = `${t.contact.title} - GienPhim`;
  }, [t.contact.title]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: t.contact.form.subjects.general, message: '' });
    }, 600);
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1 className="contact-title">{t.contact.title}</h1>
        <p className="contact-subtitle">{t.contact.subtitle}</p>
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
          <span>{t.contact.directMessage}</span>
        </div>

        {submitted ? (
          <div className="contact-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h2>{t.contact.successTitle}</h2>
            <p>{t.contact.successContent}</p>
            <button className="contact-submit" onClick={() => setSubmitted(false)}>{t.contact.sendAnother}</button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">{t.contact.form.fullName}</label>
              <input type="text" id="name" name="name" required placeholder={t.contact.form.namePlaceholder} value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t.contact.form.email}</label>
              <input type="email" id="email" name="email" required placeholder="example@domain.com" value={formData.email} onChange={handleChange} />
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
            </div>

            <div className="form-group">
              <label htmlFor="message">{t.contact.form.message}</label>
              <textarea id="message" name="message" rows="5" required placeholder={t.contact.form.messagePlaceholder} value={formData.message} onChange={handleChange}></textarea>
            </div>

            <button type="submit" className="contact-submit">{t.contact.form.submit}</button>
          </form>
        )}
      </div>
    </div>
  );
}
