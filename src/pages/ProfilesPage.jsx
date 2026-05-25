import React, { useState, useEffect, useRef } from 'react';
import posterCinema from '@/assets/poster_cinema.png';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/services/profileApi';
import { useAuth } from '@/contexts/AuthContext';
import './ProfilesPage.css';
import { getPath, useLang } from '@/utils/lang';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import StatusModal from '@/components/StatusModal/StatusModal';

export default function ProfilesPage() {
  const { t } = useLang();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [usePin, setUsePin] = useState(false);
  const [newProfilePin, setNewProfilePin] = useState('');
  const [addProfileError, setAddProfileError] = useState('');
  const [addFieldErrors, setAddFieldErrors] = useState({});
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedPinProfile, setSelectedPinProfile] = useState(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [manageMode, setManageMode] = useState(false);
  const [editProfile, setEditProfile] = useState(null); // profile being edited
  const [editName, setEditName] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editUsePin, setEditUsePin] = useState(false);
  const [editError, setEditError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pinAction, setPinAction] = useState('switch'); // 'switch' or 'edit'
  const [verifiedPin, setVerifiedPin] = useState('');
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [forgotPinError, setForgotPinError] = useState('');
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, type: 'success', title: '', description: '', onConfirm: null });

  const { selectProfile, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const pinInputRef = useRef(null);
  const newPinInputRef = useRef(null);
  const editPinInputRef = useRef(null);

  useEffect(() => {
    document.title = `${t.profiles.chooseProfile} - GienPhim`;
  }, [t.profiles.chooseProfile]);

  // Focus main pin input when modal opens
  useEffect(() => {
    if (showPinModal) {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [showPinModal]);

  // Focus new profile pin input when form opens
  useEffect(() => {
    if (showAddForm && usePin) {
      setTimeout(() => newPinInputRef.current?.focus(), 100);
    }
  }, [showAddForm, usePin]);

  // Focus edit profile pin input when edit form opens
  useEffect(() => {
    if (editProfile && editUsePin) {
      setTimeout(() => editPinInputRef.current?.focus(), 100);
    }
  }, [editProfile, editUsePin]);

  const fetchProfiles = React.useCallback(async () => {
    try {
      const res = await profileApi.getProfiles();
      if (res.data.success) {
        setProfiles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profiles', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate(getPath('login'));
      return;
    }
    fetchProfiles();
  }, [isAuthenticated, authLoading, navigate, fetchProfiles]);

  const openEditModal = (profile, validPin = '') => {
    setEditProfile(profile);
    setEditName(profile.name);
    setEditUsePin(profile.hasPin);
    setEditPin('');
    setEditError('');
    setAddFieldErrors({});
    setVerifiedPin(validPin);

  };

  const handleProfileClick = async (profile) => {
    if (manageMode) {
      if (profile.hasPin) {
        setPinAction('edit');
        setSelectedPinProfile(profile);
        setShowPinModal(true);
        setPin('');
        setPinError('');
      } else {
        openEditModal(profile);
      }
      return;
    }

    if (profile.hasPin) {
      setPinAction('switch');
      setSelectedPinProfile(profile);
      setShowPinModal(true);
      setPin('');
      setPinError('');
    } else {
      try {
        const res = await profileApi.switchProfile(profile.id);
        if (res.data.success) {
          selectProfile(profile, res.data.data.profileToken);
          navigate(getPath('home'));
        }
      } catch (err) {
        console.error('Lỗi khi chuyển hồ sơ:', err);
      }
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    try {
      const payload = { name: editName };
      
      if (editUsePin && editPin) {
        payload.pin = editPin;
      } else if (!editUsePin && editProfile.hasPin) {
        payload.pin = ''; // remove pin
      }

      if (editProfile.hasPin && verifiedPin) {
        payload.oldPin = verifiedPin;
      }

      const res = await profileApi.updateProfile(editProfile.id, payload);
      if (res.data.success) {

        setEditProfile(null);
        setVerifiedPin('');
        fetchProfiles();
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setAddFieldErrors(errorData.errors);
      } else {
        setEditError(errorData?.message || t.profiles.updateError);
      }
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await profileApi.deleteProfile(editProfile.id, verifiedPin);
      setEditProfile(null);
      setDeleteConfirm(null);
      setVerifiedPin('');
      fetchProfiles();
    } catch (err) {
      console.error('Lỗi khi xóa hồ sơ:', err);
    }
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setPin(val);
    setPinError('');
    
    if (val.length === 4) {
      // Auto submit
      setTimeout(() => {
        handlePinSubmitInternal(val);
      }, 100);
    }
  };

  const handlePinSubmitInternal = async (pinValue) => {
    try {
      const res = await profileApi.switchProfile(selectedPinProfile.id, pinValue);
      if (res.data.success) {
        if (pinAction === 'edit') {
          setShowPinModal(false);
          openEditModal(selectedPinProfile, pinValue);
        } else {
          selectProfile(selectedPinProfile, res.data.data.profileToken);
          navigate(getPath('home'));
        }
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors?.pin) {
        setPinError(errorData.errors.pin);
      } else {
        setPinError(errorData?.message || t.profiles.pinError);
      }
      setPin('');
      setTimeout(() => pinInputRef.current?.focus(), 0);
    }
  };

  const handlePinSubmit = async (e) => {
    if (e) e.preventDefault();
    handlePinSubmitInternal(pin);
  };

  const handleForgotPinSubmit = async (e) => {
    e.preventDefault();
    if (!accountPassword.trim()) return;

    setIsResettingPin(true);
    setForgotPinError('');
    try {
      const res = await profileApi.resetPinWithPassword(selectedPinProfile.id, accountPassword);
      if (res.data.success) {
        // Close the forgot pin modal first
        setShowForgotPinModal(false);
        setAccountPassword('');
        
        // Use a small timeout to ensure smooth transition
        setTimeout(() => {
          setStatusModal({
            open: true,
            type: 'success',
            title: t.profiles.resetPinSuccess,
            description: t.profiles.resetPinSuccessDesc,
            onConfirm: async () => {
              setStatusModal(prev => ({ ...prev, open: false }));
              if (pinAction === 'edit') {
                setShowPinModal(false);
                openEditModal(selectedPinProfile, '');
              } else {
                const switchRes = await profileApi.switchProfile(selectedPinProfile.id);
                if (switchRes.data.success) {
                  selectProfile(selectedPinProfile, switchRes.data.data.profileToken);
                  navigate(getPath('home'));
                }
              }
            }
          });
        }, 100);
      }
    } catch (err) {
      setForgotPinError(err.response?.data?.message || t.profiles.updateError);
    } finally {
      setIsResettingPin(false);
    }
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    try {
      const payload = { name: newProfileName };
      if (usePin && newProfilePin) payload.pin = newProfilePin;

      const res = await profileApi.createProfile(payload);
      if (res.data.success) {
        setShowAddForm(false);
        setNewProfileName('');
        setNewProfilePin('');
        setUsePin(false);
        setAddProfileError('');
        setAddFieldErrors({});
        fetchProfiles();
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setAddFieldErrors(errorData.errors);
      } else {
        setAddProfileError(errorData?.message || t.profiles.createError);
      }
    }
  };

  if (loading || authLoading) {
    return <div className="profiles-page"><div className="loader"></div></div>;
  }

  return (
    <div className="profiles-page">
      <div className="profiles-page__bg">
        <img src={posterCinema} alt="Background" onError={(e) => e.target.style.display = 'none'} />
        <div className="profiles-page__overlay"></div>
      </div>
      <div className="profiles-header">
        <h1 className="profiles-logo">GIENPHIM</h1>
      </div>

      <div className="profiles-container">
        <h1>{manageMode 
          ? t.profiles.manageProfiles 
          : t.profiles.chooseProfile}</h1>
        <div className="profiles-list">
          {profiles.map(profile => (
            <div key={profile.id} className={`profile-card ${manageMode ? 'manage-mode' : ''}`} onClick={() => handleProfileClick(profile)}>
              <div className="profile-avatar">
                <img src={profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.id}`} alt={profile.name} />
                {manageMode && (
                  <div className="profile-edit-overlay">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                  </div>
                )}
                {!manageMode && profile.hasPin && (
                  <div className="profile-lock">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
                  </div>
                )}
              </div>
              <p className="profile-name">{profile.name}</p>
            </div>
          ))}

          {profiles.length < 5 && (
            <div className="profile-card profile-add" onClick={() => {
              setShowAddForm(true);
              setAddProfileError('');
              setAddFieldErrors({});
            }}>
              <div className="profile-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg>
              </div>
              <p className="profile-name">{t.profiles.addProfile}</p>
            </div>
          )}
        </div>

        <button 
          className={`profiles-manage-btn ${manageMode ? 'active' : ''}`}
          onClick={() => setManageMode(!manageMode)}
        >
          {manageMode 
            ? t.profiles.doneManaging 
            : t.profiles.manageProfiles}
        </button>
      </div>

      {showAddForm && (
        <div className="profiles-modal">
          <div className="profiles-modal-content">
            <h2>{t.profiles.addProfile}</h2>
            <p>{t.profiles.addProfileSub}</p>
            {addProfileError && <div className="auth-alert auth-alert--error" style={{ marginBottom: '15px' }}>{addProfileError}</div>}
            <form onSubmit={handleAddProfile}>
              <div style={{ marginBottom: addFieldErrors.name ? '5px' : '20px' }}>
                <input
                  type="text"
                  placeholder={t.auth.profileName || (t.profiles.profileName)}
                  value={newProfileName}
                  onChange={e => {
                    setNewProfileName(e.target.value);
                    setAddFieldErrors({ ...addFieldErrors, name: '' });
                  }}
                  required
                  autoFocus
                  style={{ marginBottom: 0 }}
                />
                {addFieldErrors.name && <span className="field-error" style={{ marginTop: '5px', display: 'block' }}>{addFieldErrors.name}</span>}
              </div>

              <button
                type="button"
                className={`profiles-pin-toggle-btn ${usePin ? 'active' : ''}`}
                onClick={() => {
                  setUsePin(!usePin);
                  if (usePin) {
                    setNewProfilePin('');
                    setAddFieldErrors({ ...addFieldErrors, pin: '' });
                  }
                }}
              >
                <div className="toggle-indicator">
                  {usePin ? (
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
                  )}
                </div>
                {usePin 
                  ? t.profiles.noPin 
                  : t.profiles.usePin}
              </button>

              {usePin && (
                <div style={{ marginBottom: addFieldErrors.pin ? '5px' : '30px' }}>
                  <div className="pin-input-container" style={{ margin: '0 auto 10px auto' }}>
                    <input
                      type="tel"
                      maxLength={4}
                      value={newProfilePin}
                      onChange={e => {
                        setNewProfilePin(e.target.value.replace(/\D/g, ''));
                        setAddFieldErrors({ ...addFieldErrors, pin: '' });
                      }}
                      required
                      className="pin-input-hidden"
                      ref={newPinInputRef}
                    />
                    <div className="pin-display">
                      {[0, 1, 2, 3].map(index => (
                        <div 
                          key={index} 
                          className={`pin-box ${newProfilePin.length > index ? 'filled' : ''} ${newProfilePin.length === index ? 'active' : ''}`}
                          onClick={() => newPinInputRef.current?.focus()}
                        >
                          {newProfilePin.length > index ? '•' : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                  {addFieldErrors.pin && <span className="field-error" style={{ marginTop: '5px', display: 'block', textAlign: 'center' }}>{addFieldErrors.pin}</span>}
                </div>
              )}

              <div className="profiles-modal-actions">
                <button type="submit" className="btn-primary">{t.common.continue}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>{t.common.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="profiles-modal">
          <div className="profiles-modal-content pin-modal">
            <p>{t.profiles.profileLockOn}</p>
            <h2>{t.profiles.enterPinToAccess}</h2>
            {pinError && <p className="pin-error">{pinError}</p>}
            <form onSubmit={handlePinSubmit}>
              <div className="pin-input-container">
                <input
                  type="tel"
                  maxLength={4}
                  value={pin}
                  onChange={handlePinChange}
                  required
                  autoFocus
                  className="pin-input-hidden"
                  ref={pinInputRef}
                />
                <div className="pin-display">
                  {[0, 1, 2, 3].map(index => (
                    <div 
                      key={index} 
                      className={`pin-box ${pin.length > index ? 'filled' : ''} ${pin.length === index ? 'active' : ''}`}
                      onClick={() => pinInputRef.current?.focus()}
                    >
                      {pin.length > index ? '•' : ''}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="button" 
                className="forgot-pin-btn"
                onClick={() => {
                  setShowPinModal(false);
                  setShowForgotPinModal(true);
                  setForgotPinError('');
                  setAccountPassword('');
                }}
              >
                {t.profiles.forgotPin}
              </button>

              <div className="profiles-modal-actions">
                <button type="button" className="btn-secondary" style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }} onClick={() => setShowPinModal(false)}>{t.common.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForgotPinModal && (
        <div className="profiles-modal">
          <div className="profiles-modal-content pin-modal">
            <h2>{t.profiles.forgotPin}</h2>
            <p className="forgot-pin-desc">{t.profiles.resetPinDesc}</p>
            {forgotPinError && <p className="pin-error">{forgotPinError}</p>}
            <form onSubmit={handleForgotPinSubmit}>
              <div className="account-password-container" style={{ width: '100%', maxWidth: '300px', margin: '0 auto 30px auto' }}>
                <input
                  type="password"
                  placeholder={t.profiles.accountPassword}
                  value={accountPassword}
                  onChange={e => setAccountPassword(e.target.value)}
                  required
                  autoFocus
                  className="account-password-input"
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div className="profiles-modal-actions">
                <button type="submit" className="btn-primary" disabled={isResettingPin}>
                  {isResettingPin ? (t.common.loading || '...') : t.common.continue}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowForgotPinModal(false);
                    setShowPinModal(true);
                  }}
                >
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editProfile && (
        <div className="profiles-modal">
          <div className="profiles-modal-content">
            <h2>{t.profiles.editProfile}</h2>
            {editError && <div className="auth-alert auth-alert--error" style={{ marginBottom: '15px' }}>{editError}</div>}
            

              <form onSubmit={handleEditProfile}>
                <div style={{ marginBottom: addFieldErrors.name ? '5px' : '20px' }}>
                  <input
                    type="text"
                    placeholder={t.profiles.profileName}
                    value={editName}
                    onChange={e => {
                      setEditName(e.target.value);
                      setAddFieldErrors({ ...addFieldErrors, name: '' });
                    }}
                    required
                    style={{ marginBottom: 0 }}
                  />
                  {addFieldErrors.name && <span className="field-error" style={{marginTop: '5px', display: 'block'}}>{addFieldErrors.name}</span>}
                </div>

                <button
                  type="button"
                  className={`profiles-pin-toggle-btn ${editUsePin ? 'active' : ''}`}
                  onClick={() => {
                    setEditUsePin(!editUsePin);
                    if (editUsePin) {
                      setEditPin('');
                      setAddFieldErrors({ ...addFieldErrors, pin: '' });
                    }
                  }}
                >
                  <div className="toggle-indicator">
                    {editUsePin ? (
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg>
                    )}
                  </div>
                  {editUsePin 
                    ? t.profiles.noPin 
                    : t.profiles.usePin}
                </button>

                {editUsePin && (
                  <div style={{ marginBottom: addFieldErrors.pin ? '5px' : '30px' }}>
                    <p style={{ textAlign: 'center', marginBottom: '15px' }}>
                      {editProfile.hasPin 
                        ? t.profiles.enterNewPin 
                        : t.profiles.enterPin4}
                    </p>
                    <div className="pin-input-container" style={{ margin: '0 auto 10px auto' }}>
                      <input
                        type="tel"
                        maxLength={4}
                        value={editPin}
                        onChange={e => {
                          setEditPin(e.target.value.replace(/\D/g, ''));
                          setAddFieldErrors({ ...addFieldErrors, pin: '' });
                        }}
                        required={!editProfile.hasPin}
                        className="pin-input-hidden"
                        ref={editPinInputRef}
                      />
                      <div className="pin-display">
                        {[0, 1, 2, 3].map(index => (
                          <div 
                            key={index} 
                            className={`pin-box ${editPin.length > index ? 'filled' : ''} ${editPin.length === index ? 'active' : ''}`}
                            onClick={() => editPinInputRef.current?.focus()}
                          >
                            {editPin.length > index ? '•' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                    {addFieldErrors.pin && <span className="field-error" style={{marginTop: '5px', display: 'block', textAlign: 'center'}}>{addFieldErrors.pin}</span>}
                  </div>
                )}

                <div className="profiles-modal-actions edit-actions" style={{marginTop: '30px'}}>
                  <div className="primary-actions">
                    <button type="submit" className="btn-primary">{t.profiles.saveProfile}</button>
                    <button type="button" className="btn-secondary" onClick={() => setEditProfile(null)}>{t.common.cancel}</button>
                  </div>
                  <button type="button" className="btn-delete" onClick={() => setDeleteConfirm(editProfile.id)}>{t.profiles.deleteProfile}</button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* Reusable Confirm Modal for Deleting Profile */}
      <ConfirmModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title={t.profiles.deleteProfile}
        description={t.profiles.confirmDeleteMsg}
        confirmText={t.profiles.deleteProfile}
        cancelText={t.common.cancel}
        onConfirm={handleDeleteProfile}
        showCloseButton={true}
        confirmButtonClass="modal-btn-primary"
      />

      <StatusModal
        isOpen={statusModal.open}
        type={statusModal.type}
        title={statusModal.title}
        description={statusModal.description}
        onClose={statusModal.onConfirm || (() => setStatusModal(prev => ({ ...prev, open: false })))}
      />
    </div>
  );
}
