import React from 'react';
import { Link } from 'react-router-dom';
import AuthInput from './AuthInput';
import { getPath, getT } from '@/utils/lang';

export default function RegisterForm({
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  acceptTerms, setAcceptTerms,
  loading, fieldErrors,
  handleRegister, setView,
  clearErrors, setMessage,
  error, message
}) {
  const t = getT();

  return (
    <form className="auth-form" onSubmit={handleRegister}>
      <h2>{t.auth.signUp}</h2>
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
        minLength={6}
      />

      <AuthInput
        label={t.auth.confirmPassword}
        type="password"
        value={confirmPassword}
        onChange={e => { setConfirmPassword(e.target.value); clearErrors('confirmPassword'); }}
        error={fieldErrors.confirmPassword}
        required
      />

      <div className="auth-checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={e => { setAcceptTerms(e.target.checked); clearErrors('acceptTerms'); }}
          />
          <span className="checkbox-text">
            {t.auth.acceptTerms}{' '}
            <Link to={getPath('terms')} target="_blank">{t.auth.termsLink}</Link>{' '}
            {t.auth.and}{' '}
            <Link to={getPath('privacy')} target="_blank">{t.auth.privacyLink}</Link>.
          </span>
        </label>
        {fieldErrors.acceptTerms && <span className="auth-error-text">{fieldErrors.acceptTerms}</span>}
      </div>

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? t.common.processing : t.auth.signUp}
      </button>

      <p className="auth-switch">
        {t.auth.alreadyHaveAccount}{' '}
        <button type="button" onClick={() => { setView('LOGIN'); clearErrors(); setMessage(''); }}>
          {t.auth.signInNow}
        </button>.
      </p>
    </form>
  );
}
