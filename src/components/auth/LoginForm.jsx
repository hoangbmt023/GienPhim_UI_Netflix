import React from 'react';
import AuthInput from './AuthInput';
import { getPath, getT } from '@/utils/lang';
import { Link } from 'react-router-dom';

export default function LoginForm({
  email, setEmail,
  password, setPassword,
  loading, fieldErrors,
  handleLogin, setView,
  clearErrors, setMessage,
  error, message
}) {
  const t = getT();

  return (
    <form className="auth-form" onSubmit={handleLogin}>
      <h2>{t.auth.signIn}</h2>
      {error && <div className="auth-alert auth-alert--error">{error}</div>}
      {message && <div className="auth-alert auth-alert--success">{message}</div>}

      <AuthInput
        label={t.auth.email}
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); clearErrors('email'); }}
        error={fieldErrors.email}
        required
      />

      <AuthInput
        label={t.auth.password}
        type="password"
        value={password}
        onChange={e => { setPassword(e.target.value); clearErrors('password'); }}
        error={fieldErrors.password}
        required
      />

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? t.common.processing : t.auth.signIn}
      </button>

      <div className="auth-form-footer">
        <button type="button" className="auth-link" onClick={() => { setView('FORGOT_PASSWORD'); clearErrors(); setMessage(''); }}>
          {t.auth.forgotPassword}
        </button>
      </div>

      <p className="auth-switch">
        {t.auth.newToGienPhim}{' '}
        <button type="button" onClick={() => { setView('REGISTER'); clearErrors(); setMessage(''); }}>
          {t.auth.signUpNow}
        </button>.
      </p>
    </form>
  );
}
