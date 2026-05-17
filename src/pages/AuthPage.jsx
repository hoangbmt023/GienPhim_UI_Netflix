import React, { useState } from 'react';
import posterAuth from '@/assets/poster_auth.jpg';
import { useNavigate} from 'react-router-dom';
import { authApi } from '@/services/authApi';
import { userApi } from '@/services/userApi';
import { useAuth } from '@/contexts/AuthContext';
import './AuthPage.css';
import { getPath, useLang } from '@/utils/lang';

import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import VerifyOtpForm from '@/components/auth/VerifyOtpForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import StatusModal from '@/components/StatusModal/StatusModal';

export default function AuthPage({ initialView = 'LOGIN' }) {
  const { t } = useLang();
  const [view, setView] = useState(initialView); // LOGIN, REGISTER, FORGOT_PASSWORD, VERIFY_OTP, RESET_PASSWORD

  const navigate = useNavigate();

  React.useEffect(() => {
    setView(initialView);
  }, [initialView]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', desc: '', onClose: null });

  const { login, isAuthenticated, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(getPath('profiles'));
    }
  }, [isAuthenticated, authLoading, navigate]);

  React.useEffect(() => {
    const titles = {
      LOGIN: t.auth.signIn,
      REGISTER: t.auth.signUp,
      FORGOT_PASSWORD: t.auth.forgotPassword,
      VERIFY_OTP: t.auth.emailVerification,
      RESET_PASSWORD: t.auth.resetPassword
    };
    const currentTitle = titles[view] || t.auth.signIn;
    document.title = `${currentTitle} - GienPhim`;
  }, [view, t.auth]);

  const handleApiError = (err) => {
    const errorData = err.response?.data;
    if (errorData?.errors) {
      setFieldErrors(errorData.errors);
      setError(''); // Hide global error if there are field errors
    } else if (errorData?.message) {
      setError(errorData.message);
      setFieldErrors({});
    } else {
      setError(t.auth.somethingWentWrong);
      setFieldErrors({});
    }
    setMessage('');
  };

  const clearErrors = (field) => {
    if (field) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
      setError(''); // Clear global error as soon as user modifies any input
    } else {
      setError('');
      setFieldErrors({});
    }
  };

  const changeView = (newView) => {
    clearErrors();
    setMessage('');
    const routeMap = {
      'LOGIN': 'login',
      'REGISTER': 'register',
      'FORGOT_PASSWORD': 'forgotPassword',
      'VERIFY_OTP': 'verifyOtp',
      'RESET_PASSWORD': 'resetPassword'
    };
    navigate(getPath(routeMap[newView]));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.data.success) {
        login(res.data.data.accessToken, res.data.data.refreshToken);
        navigate(getPath('profiles'));
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || '';

      // Tài khoản chưa kích hoạt (403)
      if (status === 403 && msg.includes('kích hoạt')) {
        setShowActivateModal(true);
      } else {
        handleApiError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendActivateOtp = async () => {
    setShowActivateModal(false);
    setLoading(true);
    try {
      await authApi.sendActivateOtp(email);
      setMessage(t.auth.otpSentSuccess(email));
      clearErrors();
      setOtp('');
      changeView('VERIFY_OTP');
    } catch (err) {
      setError(err.response?.data?.message || t.auth.otpFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: t.auth.passwordMismatch });
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setFieldErrors({ acceptTerms: t.auth.mustAcceptTerms });
      setLoading(false);
      return;
    }

    try {
      await userApi.register({ email, password });
      setMessage(t.auth.registerSuccess);
      changeView('VERIFY_OTP');
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await authApi.activateAccount(email, otp);
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: t.auth.successTitle,
        desc: t.auth.activateSuccess,
        onClose: () => {
          setStatusModal(prev => ({ ...prev, isOpen: false }));
          changeView('LOGIN');
          setOtp('');
          setPassword('');
        }
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setMessage(t.auth.forgotSuccess);
      changeView('RESET_PASSWORD');
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      setFieldErrors({ confirmNewPassword: t.auth.passwordMismatch });
      setLoading(false);
      return;
    }

    try {
      await authApi.resetPassword({ email, otp, newPassword, logoutAllDevices: true });
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: t.auth.successTitle,
        desc: t.auth.resetSuccess,
        onClose: () => {
          setStatusModal(prev => ({ ...prev, isOpen: false }));
          changeView('LOGIN');
          setOtp('');
          setNewPassword('');
          setConfirmNewPassword('');
          setPassword('');
        }
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <div className="auth-page">
        <div className="auth-page__bg">
          <img src={posterAuth} alt="Background" onError={(e) => e.target.style.display = 'none'} />
          <div className="auth-page__overlay"></div>
        </div>
        <div className="auth-page__header">
          <h1 className="auth-page__logo" onClick={() => navigate(getPath('home'))}>GIENPHIM</h1>
        </div>

        <div className="auth-container">
          {view === 'LOGIN' && (
            <LoginForm
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              loading={loading} fieldErrors={fieldErrors}
              handleLogin={handleLogin} setView={changeView}
              clearErrors={clearErrors} setMessage={setMessage}
              error={error} message={message}
            />
          )}

          {view === 'REGISTER' && (
            <RegisterForm
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              acceptTerms={acceptTerms} setAcceptTerms={setAcceptTerms}
              loading={loading} fieldErrors={fieldErrors}
              handleRegister={handleRegister} setView={changeView}
              clearErrors={clearErrors} setMessage={setMessage}
              error={error} message={message}
            />
          )}

          {view === 'VERIFY_OTP' && (
            <VerifyOtpForm
              email={email}
              otp={otp} setOtp={setOtp}
              loading={loading} fieldErrors={fieldErrors}
              handleVerifyOtp={handleVerifyOtp} handleSendActivateOtp={handleSendActivateOtp}
              setView={changeView} clearErrors={clearErrors} setMessage={setMessage}
              error={error} message={message}
            />
          )}

          {view === 'FORGOT_PASSWORD' && (
            <ForgotPasswordForm
              email={email} setEmail={setEmail}
              loading={loading} fieldErrors={fieldErrors}
              handleForgotPassword={handleForgotPassword} setView={changeView}
              clearErrors={clearErrors} setMessage={setMessage}
              error={error} message={message}
            />
          )}

          {view === 'RESET_PASSWORD' && (
            <ResetPasswordForm
              otp={otp} setOtp={setOtp}
              newPassword={newPassword} setNewPassword={setNewPassword}
              confirmNewPassword={confirmNewPassword} setConfirmNewPassword={setConfirmNewPassword}
              loading={loading} fieldErrors={fieldErrors}
              handleResetPassword={handleResetPassword} setView={changeView}
              clearErrors={clearErrors} setMessage={setMessage}
              error={error} message={message}
            />
          )}
        </div>
      </div>

      {/* Modal kích hoạt tài khoản */}
      <ConfirmModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        title={t.auth.accountNotActivated}
        description={t.auth.activatePrompt}
        confirmText={t.auth.sendOtp}
        cancelText={t.common.cancel}
        onConfirm={handleSendActivateOtp}
        isLoading={loading}
        showCloseButton={true}
      />

      {/* Modal trạng thái (Thành công, Thất bại, Cảnh báo) */}
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        description={statusModal.desc}
        onClose={() => {
          if (statusModal.onClose) statusModal.onClose();
          else setStatusModal(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </>
  );
}

