import React from 'react';
import AuthInput from './AuthInput';
import { getT } from '@/utils/lang';

export default function VerifyOtpForm({
  email, otp, setOtp,
  loading, fieldErrors,
  handleVerifyOtp, handleSendActivateOtp,
  setView, clearErrors, setMessage,
  error, message
}) {
  const t = getT();

  return (
    <form className="auth-form" onSubmit={handleVerifyOtp}>
      <h2>{t.auth.emailVerification}</h2>
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      {message && <div className="auth-alert auth-alert--success">{message}</div>}
      <p className="auth-desc">
        {t.auth.otpSentTo}{' '}<strong>{email}</strong>
      </p>

      <AuthInput
        label={t.auth.otp6digit}
        type="text"
        value={otp}
        onChange={e => { setOtp(e.target.value); clearErrors('otp'); }}
        error={fieldErrors.otp}
        required
        maxLength={6}
      />

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? t.auth.verifying : t.auth.verify}
      </button>

      <div className="auth-form-footer">
        <button type="button" className="auth-link" onClick={() => { setView('LOGIN'); clearErrors(); setMessage(''); }}>
          {t.auth.backToSignIn}
        </button>
        <button type="button" className="auth-link" onClick={handleSendActivateOtp}>
          {t.auth.resendOtp}
        </button>
      </div>
    </form>
  );
}
