import React from 'react';
import AuthInput from './AuthInput';
import { getT } from '@/utils/lang';

export default function ForgotPasswordForm({
  email, setEmail,
  loading, fieldErrors,
  handleForgotPassword, setView,
  clearErrors, setMessage,
  error, message
}) {
  const t = getT();

  return (
    <form className="auth-form" onSubmit={handleForgotPassword}>
      <h2>{t.auth.forgotPassword}</h2>
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      {message && <div className="auth-alert auth-alert--success">{message}</div>}
      <p className="auth-desc">{t.auth.enterEmailForOtp}</p>

      <AuthInput
        label={t.auth.email}
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); clearErrors('email'); }}
        error={fieldErrors.email}
        required
      />

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? t.common.processing : t.auth.sendOtp}
      </button>

      <div className="auth-form-footer" style={{ marginTop: '20px' }}>
        <button type="button" className="auth-link" onClick={() => { setView('LOGIN'); clearErrors(); setMessage(''); }}>
          {t.auth.backToSignIn}
        </button>
      </div>
    </form>
  );
}
