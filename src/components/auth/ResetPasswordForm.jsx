import React from 'react';
import AuthInput from './AuthInput';
import { getT } from '@/utils/lang';

export default function ResetPasswordForm({
  otp, setOtp,
  newPassword, setNewPassword,
  confirmNewPassword, setConfirmNewPassword,
  loading, fieldErrors,
  handleResetPassword, setView,
  clearErrors, setMessage,
  error, message
}) {
  const t = getT();

  return (
    <form className="auth-form" onSubmit={handleResetPassword}>
      <h2>{t.auth.resetPassword}</h2>
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      {message && <div className="auth-alert auth-alert--success">{message}</div>}

      <AuthInput
        label={t.auth.otpCode}
        type="text"
        value={otp}
        onChange={e => { setOtp(e.target.value); clearErrors('otp'); }}
        error={fieldErrors.otp}
        required
        maxLength={6}
      />

      <AuthInput
        label={t.auth.newPassword}
        type="password"
        value={newPassword}
        onChange={e => { setNewPassword(e.target.value); clearErrors('newPassword'); }}
        error={fieldErrors.newPassword}
        required
        minLength={6}
      />

      <AuthInput
        label={t.auth.confirmNewPassword}
        type="password"
        value={confirmNewPassword}
        onChange={e => { setConfirmNewPassword(e.target.value); clearErrors('confirmNewPassword'); }}
        error={fieldErrors.confirmNewPassword}
        required
        minLength={6}
      />

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? t.common.processing : t.auth.changePassword}
      </button>

      <div className="auth-form-footer" style={{ marginTop: '20px' }}>
        <button type="button" className="auth-link" onClick={() => { setView('LOGIN'); clearErrors(); setMessage(''); }}>
          {t.auth.backToSignIn}
        </button>
      </div>
    </form>
  );
}
