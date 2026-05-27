import React, { useState, useEffect, useRef } from 'react';
import { announcementApi } from '@/services/announcementApi';
import { Plus, Trash2, CheckCircle, XCircle, RotateCcw, Flame } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import StatusModal from '@/components/StatusModal/StatusModal';
import Pagination from '@/components/Pagination/Pagination';
import { useAuth } from '@/contexts/AuthContext';

import { useLang } from '@/utils/lang';

import CustomSelect from '@/components/CustomSelect/CustomSelect';
import './AnnouncementPanel.css';

export default function AnnouncementPanel() {
  const { user } = useAuth();
  const { t } = useLang();
  const s = t.admin;
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    badge: 'THÔNG BÁO',
    text: '',
    link: '',
    type: 'INFO',
    display: 'BAR',
    scope: 'MARKETING',
    startAt: '',
    endAt: ''
  });

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [confirmForceDelete, setConfirmForceDelete] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [filterScope, setFilterScope] = useState('');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'trash'
  const [statusModal, setStatusModal] = useState({ open: false, type: 'success', title: '', description: '' });
  const [activeDatePickerField, setActiveDatePickerField] = useState(null);
  const [tempDate, setTempDate] = useState({ day: '1', month: '1', year: '2026', hour: '12', minute: '00', ampm: 'AM' });

  const fetchAnnouncements = async (page = 1) => {
    setLoading(true);
    try {
      const res = viewMode === 'trash'
        ? await announcementApi.getDeleted({ page, size: 10 })
        : await announcementApi.getAll({ page, size: 10, scope: filterScope });
      if (res.data.success) {
        setAnnouncements(res.data.data);
        setCurrentPage(res.data.pagination?.page || 1);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements(1);
  }, [filterScope, viewMode]);

  const openAddForm = () => {
    setEditItem(null);
    setFormData({
      title: '', badge: 'THÔNG BÁO', text: '', link: '',
      type: 'INFO', display: 'BAR', scope: 'MARKETING', startAt: '', endAt: ''
    });
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      badge: item.badge,
      text: item.text,
      link: item.link || '',
      type: item.type,
      display: item.display,
      scope: item.scope,
      startAt: item.startAt ? new Date(item.startAt).toISOString().slice(0, 16) : '',
      endAt: item.endAt ? new Date(item.endAt).toISOString().slice(0, 16) : ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.startAt) delete payload.startAt;
      else payload.startAt = new Date(payload.startAt).toISOString();
      if (!payload.endAt) delete payload.endAt;
      else payload.endAt = new Date(payload.endAt).toISOString();

      if (editItem) {
        await announcementApi.update(editItem.id, payload);
        setStatusModal({ open: true, type: 'success', title: 'Thành công', description: s.successUpdate || 'Cập nhật thông báo thành công' });
      } else {
        await announcementApi.create(payload);
        setStatusModal({ open: true, type: 'success', title: 'Thành công', description: s.successCreate || 'Tạo thông báo thành công' });
      }
      setShowForm(false);
      fetchAnnouncements(currentPage);
    } catch (err) {
      setStatusModal({ open: true, type: 'error', title: s.error || 'Lỗi', description: err.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const handleTogglePublish = async () => {
    if (!confirmToggle) return;
    try {
      if (confirmToggle.isActive) {
        await announcementApi.unpublish(confirmToggle.id);
      } else {
        await announcementApi.publish(confirmToggle.id);
      }
      setConfirmToggle(null);
      fetchAnnouncements(currentPage);
    } catch (err) {
      setStatusModal({ open: true, type: 'error', title: s.error || 'Lỗi', description: err.response?.data?.message || 'Không thể thay đổi trạng thái' });
    }
  };

  const handleDelete = async () => {
    try {
      await announcementApi.delete(confirmDelete.id);
      setConfirmDelete(null);
      fetchAnnouncements(currentPage);
      setStatusModal({ open: true, type: 'success', title: 'Thành công', description: s.successDelete || 'Đã chuyển thông báo vào thùng rác' });
    } catch (err) {
      setStatusModal({ open: true, type: 'error', title: s.error || 'Lỗi', description: err.response?.data?.message || 'Lỗi khi xóa' });
    }
  };

  const handleRestore = async () => {
    try {
      await announcementApi.restore(confirmRestore.id);
      setConfirmRestore(null);
      fetchAnnouncements(currentPage);
      setStatusModal({ open: true, type: 'success', title: 'Thành công', description: 'Đã khôi phục thông báo' });
    } catch (err) {
      setStatusModal({ open: true, type: 'error', title: s.error || 'Lỗi', description: err.response?.data?.message || 'Lỗi khi khôi phục' });
    }
  };

  const handleForceDelete = async () => {
    try {
      await announcementApi.forceDelete(confirmForceDelete.id);
      setConfirmForceDelete(null);
      fetchAnnouncements(currentPage);
      setStatusModal({ open: true, type: 'success', title: 'Thành công', description: 'Đã xóa vĩnh viễn thông báo' });
    } catch (err) {
      setStatusModal({ open: true, type: 'error', title: s.error || 'Lỗi', description: err.response?.data?.message || 'Lỗi khi xóa vĩnh viễn' });
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('vi-VN');

  const openDatePicker = (field) => {
    const value = formData[field];
    let dateObj = value ? new Date(value) : new Date();
    if (isNaN(dateObj.getTime())) dateObj = new Date();

    let hour = dateObj.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;

    setTempDate({
      day: dateObj.getDate().toString(),
      month: (dateObj.getMonth() + 1).toString(),
      year: dateObj.getFullYear().toString(),
      hour: hour.toString(),
      minute: dateObj.getMinutes().toString().padStart(2, '0'),
      ampm: ampm
    });
    setActiveDatePickerField(field);
  };

  const handleSaveTempDate = () => {
    let hour = parseInt(tempDate.hour);
    if (tempDate.ampm === 'PM' && hour < 12) hour += 12;
    if (tempDate.ampm === 'AM' && hour === 12) hour = 0;

    const dateStr = `${tempDate.year}-${tempDate.month.padStart(2, '0')}-${tempDate.day.padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${tempDate.minute.padStart(2, '0')}`;
    setFormData({ ...formData, [activeDatePickerField]: dateStr });
    setActiveDatePickerField(null);
  };

  const handleActionSelect = (action, item) => {
    if (action === 'detail') setSelectedDetail(item);
    else if (action === 'toggle') setConfirmToggle(item);
    else if (action === 'edit') openEditForm(item);
    else if (action === 'delete') setConfirmDelete(item);
    else if (action === 'restore') setConfirmRestore(item);
    else if (action === 'forceDelete') setConfirmForceDelete(item);
  };

  const filteredAnnouncements = announcements;

  return (
    <div className="admin-panel-content">
      <div className="mod-header-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '24px', fontWeight: '600' }}>{s.manageAnnouncements || 'Quản lý thông báo'}</h2>
          {user?.role === 'ADMIN' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`studio-filter-btn${viewMode === 'active' ? ' active' : ''}`}
                onClick={() => { setViewMode('active'); setFilterScope(''); }}
              >
                {s.active || 'Đang hoạt động'}
              </button>
              <button
                className={`studio-filter-btn${viewMode === 'trash' ? ' active' : ''}`}
                onClick={() => setViewMode('trash')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Trash2 size={13} /> {s.trash || 'Thùng rác'}
              </button>
            </div>
          )}
        </div>
        {viewMode === 'active' && (
          <button className="btn-primary" onClick={openAddForm} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={16} /> {s.addAnnouncement || 'Thêm mới'}
          </button>
        )}
      </div>

      {!showForm && viewMode === 'active' && (
        <div className="studio-filter-bar">
          <button className={`studio-filter-btn ${filterScope === '' ? 'active' : ''}`} onClick={() => setFilterScope('')}>{s.all || 'Tất cả'}</button>
          <button className={`studio-filter-btn ${filterScope === 'MARKETING' ? 'active' : ''}`} onClick={() => setFilterScope('MARKETING')}>MARKETING</button>
          <button className={`studio-filter-btn ${filterScope === 'CONTENT' ? 'active' : ''}`} onClick={() => setFilterScope('CONTENT')}>CONTENT</button>
          <button className={`studio-filter-btn ${filterScope === 'SYSTEM' ? 'active' : ''}`} onClick={() => setFilterScope('SYSTEM')}>SYSTEM</button>
        </div>
      )}

      <div className="mod-layout" style={{ display: 'block' }}>
        {showForm ? (
          <div className="ann-form-card admin-data-card" style={{ padding: 'var(--card-padding, 30px)' }}>
            <h3 style={{ color: 'var(--text-primary)', margin: '0 0 20px 0' }}>{editItem ? (s.editAnnouncement || 'Sửa thông báo') : (s.newAnnouncement || 'Thêm thông báo mới')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div>
                  <label>{s.title || 'Tên nội bộ (Title)'}</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <label>{s.badge || 'Badge (nhãn)'}</label>
                  <input type="text" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>{s.content || 'Nội dung hiển thị (Text)'}</label>
                  <textarea value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} required rows="3"></textarea>
                </div>
                <div>
                  <label>{s.link || 'Đường dẫn (Link)'}</label>
                  <input type="url" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} />
                </div>
                <div>
                  <label>{s.scope || 'Phạm vi'}</label>
                  <CustomSelect
                    value={formData.scope}
                    onChange={val => setFormData({ ...formData, scope: val })}
                    options={[
                      { value: "MARKETING", label: s.scopeMarketing || "MARKETING (Khuyến mãi, Event)" },
                      { value: "CONTENT", label: s.scopeContent || "CONTENT (Cập nhật phim)" },
                      ...(user?.role === 'ADMIN' ? [{ value: "SYSTEM", label: s.scopeSystem || "SYSTEM (Hệ thống, Bảo trì)" }] : [])
                    ]}
                    disabled={user?.role === 'MODERATOR' && formData.scope === 'SYSTEM'}
                  />
                </div>
                <div>
                  <label>{s.displayType || 'Kiểu hiển thị'}</label>
                  <CustomSelect
                    value={formData.display}
                    onChange={val => setFormData({ ...formData, display: val })}
                    options={[
                      { value: "BAR", label: s.displayBar || "Thanh ngang (BAR)" },
                      { value: "BOX", label: s.displayModal || "Hộp thoại (BOX)" },
                    ]}
                  />
                </div>
                <div>
                  <label>{s.level || 'Mức độ'}</label>
                  <CustomSelect
                    value={formData.type}
                    onChange={val => setFormData({ ...formData, type: val })}
                    options={[
                      { value: "INFO", label: s.levelInfo || "INFO (Thông tin)" },
                      { value: "WARNING", label: s.levelWarning || "WARNING (Cảnh báo)" },
                      { value: "DANGER", label: s.levelDanger || "DANGER (Quan trọng)" },
                      { value: "SUCCESS", label: s.levelSuccess || "SUCCESS (Thành công)" }
                    ]}
                  />
                </div>
                <div>
                  <label>{s.startDate || 'Ngày bắt đầu'}</label>
                  <div
                    onClick={() => openDatePicker('startAt')}
                    className={`custom-datetime-trigger ${formData.startAt ? 'has-value' : ''}`}
                  >
                    <span>{formData.startAt ? formatDate(formData.startAt) : 'Chọn ngày giờ...'}</span>
                    <span className="calendar-icon">📅</span>
                  </div>
                </div>
                <div>
                  <label>{s.endDate || 'Ngày kết thúc'}</label>
                  <div
                    onClick={() => openDatePicker('endAt')}
                    className={`custom-datetime-trigger ${formData.endAt ? 'has-value' : ''}`}
                  >
                    <span>{formData.endAt ? formatDate(formData.endAt) : 'Chọn ngày giờ...'}</span>
                    <span className="calendar-icon">📅</span>
                  </div>
                </div>
              </div>
              <div className="ann-form-actions">
                <button type="submit" className="btn-primary">{s.saveAnnouncement || 'Lưu'}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>{s.cancel || 'Hủy'}</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="admin-data-card" style={{ padding: '0' }}>
            <div className="table-responsive">
              <table className="admin-table" style={{ width: '100%', color: 'var(--text-primary)', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary, rgba(255,255,255,0.05))', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>{s.status || 'Trạng thái'}</th>
                    <th style={{ padding: '12px' }}>{s.title || 'Tiêu đề / Badge'}</th>
                    <th>{s.displayType || 'Kiểu'}</th>
                    <th>{s.scope || 'Phạm vi'}</th>
                    <th>{s.time || 'Thời gian'}</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>{s.actions || 'Thao tác'}</th>
                  </tr>
                </thead>
                <tbody style={{ opacity: (loading && filteredAnnouncements.length > 0) ? 0.5 : 1, transition: 'opacity 0.2s ease', pointerEvents: loading ? 'none' : 'auto' }}>
                  {loading && filteredAnnouncements.length === 0 ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <tr key={`skeleton-${i}`}>
                        <td colSpan="6" style={{ padding: 0, borderBottom: '1px solid var(--border-color)' }}>
                          <div className="mod-ticket-skeleton" style={{ height: '76px', borderBottom: 'none' }} />
                        </td>
                      </tr>
                    ))
                  ) : !loading && filteredAnnouncements.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>{s.noAnnouncements || 'Không có thông báo nào.'}</td></tr>
                  ) : (
                    filteredAnnouncements.map(a => {
                      let typeClass = 'default';
                      if (a.type === 'INFO') typeClass = 'info';
                      else if (a.type === 'WARNING') typeClass = 'warning';
                      else if (a.type === 'DANGER') typeClass = 'danger';
                      else if (a.type === 'SUCCESS') typeClass = 'success';

                      let scopeClass = 'default';
                      if (a.scope === 'MARKETING') scopeClass = 'info';
                      else if (a.scope === 'CONTENT') scopeClass = 'success';
                      else if (a.scope === 'SYSTEM') scopeClass = 'danger';

                      return (
                        <tr key={a.id}>
                          <td style={{ padding: '12px' }}>
                            {a.isActive ? (
                              <span className="badge-pill success"><CheckCircle size={12} /> {s.active || 'Active'}</span>
                            ) : (
                              <span className="badge-pill default"><XCircle size={12} /> {s.draft || 'Draft'}</span>
                            )}
                          </td>
                          <td className="truncate-cell" style={{ padding: '12px' }} title={a.title}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ background: 'var(--bg-tertiary, rgba(0,0,0,0.08))', border: '1px solid var(--border-color, rgba(0,0,0,0.12))', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>{a.badge}</span>
                              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{a.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                              <span className={`badge-pill ${typeClass}`}>{a.type}</span>
                              <span className="badge-pill default">{a.display}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span className={`badge-pill ${scopeClass}`}>{a.scope}</span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                            {a.startAt && <div>{s.from || 'Từ'}: {formatDate(a.startAt)}</div>}
                            {a.endAt && <div>{s.to || 'Đến'}: {formatDate(a.endAt)}</div>}
                            {!a.startAt && !a.endAt && <div>{s.forever || 'Vĩnh viễn'}</div>}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            {viewMode === 'trash' ? (
                              <CustomSelect
                                isFixed={true}
                                triggerText={s.actions || 'Thao tác...'}
                                triggerStyle={{ padding: '6px 12px', minWidth: '110px' }}
                                onChange={(action) => handleActionSelect(action, a)}
                                options={[
                                  { value: 'detail', label: s.actionDetail || 'Thông tin' },
                                  { value: 'restore', label: s.actionRestore || 'Khôi phục' },
                                  { value: 'forceDelete', label: s.actionForceDelete || 'Xóa vĩnh viễn' }
                                ]}
                              />
                            ) : (
                              (user?.role === 'ADMIN' || (user?.role === 'MODERATOR' && a.scope !== 'SYSTEM')) && (
                                <CustomSelect
                                  isFixed={true}
                                  triggerText={s.actions || 'Thao tác...'}
                                  triggerStyle={{ padding: '6px 12px', minWidth: '110px' }}
                                  onChange={(action) => handleActionSelect(action, a)}
                                  options={[
                                    { value: 'detail', label: s.actionDetail || 'Thông tin' },
                                    ...(user?.role === 'ADMIN' ? [{ value: 'toggle', label: a.isActive ? (s.actionUnpublish || 'Ẩn thông báo') : (s.actionPublish || 'Hiện thông báo') }] : []),
                                    { value: 'edit', label: s.actionEdit || 'Chỉnh sửa' },
                                    ...(user?.role === 'ADMIN' ? [{ value: 'delete', label: s.actionDelete || 'Xóa (vào thùng rác)' }] : []),
                                  ]}
                                />
                              )
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchAnnouncements(page)}
                showInfo={true}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={s.deleteTitle || 'Chuyển vào thùng rác'}
        description={s.deleteDesc || 'Thông báo sẽ bị ẩn và chuyển vào thùng rác. Bạn có thể khôi phục sau.'}
        confirmText={s.deleteBtn || 'Xóa mềm'}
        cancelText={s.cancel || 'Hủy'}
        onConfirm={handleDelete}
        confirmButtonClass="modal-btn-danger"
      />

      <ConfirmModal
        isOpen={!!confirmRestore}
        onClose={() => setConfirmRestore(null)}
        title={s.restoreTitle || 'Khôi phục thông báo'}
        description={s.restoreDesc || 'Thông báo sẽ được khôi phục về trạng thái Draft. Bạn cần publish lại nếu muốn hiển thị.'}
        confirmText={s.restoreBtn || 'Khôi phục'}
        cancelText={s.cancel || 'Hủy'}
        onConfirm={handleRestore}
      />

      <ConfirmModal
        isOpen={!!confirmForceDelete}
        onClose={() => setConfirmForceDelete(null)}
        title={s.forceDeleteTitle || 'Xóa vĩnh viễn'}
        description={s.forceDeleteDesc || 'Hành động này KHÔNG THỂ hoàn tác. Thông báo sẽ bị xóa hoàn toàn khỏi hệ thống.'}
        confirmText={s.forceDeleteBtn || 'Xóa vĩnh viễn'}
        cancelText={s.cancel || 'Hủy'}
        onConfirm={handleForceDelete}
        confirmButtonClass="modal-btn-danger"
      />

      <ConfirmModal
        isOpen={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        title={s.publishTitle || "Thay đổi trạng thái"}
        description={s.publishDesc || "Bạn có chắc chắn muốn thay đổi trạng thái của thông báo này?"}
        confirmText={s.confirmToggle || "Đồng ý"}
        cancelText={s.cancel || "Hủy"}
        onConfirm={handleTogglePublish}
        confirmButtonClass="modal-btn-primary"
      />

      <StatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal(s => ({ ...s, open: false }))}
        type={statusModal.type}
        title={statusModal.title}
        description={statusModal.description}
      />

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="detail-modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="detail-modal-card" onClick={e => e.stopPropagation()}>
            <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
              {t.common.info || 'Chi tiết thông báo'}
            </h3>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.title || 'Tiêu đề'}:</span>
              <span className="detail-modal-val" style={{ fontWeight: 'bold' }}>{selectedDetail.title}</span>
            </div>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.badge || 'Badge'}:</span>
              <span className="detail-modal-val">
                <span style={{ background: 'var(--bg-tertiary, rgba(255,255,255,0.1))', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em' }}>
                  {selectedDetail.badge}
                </span>
              </span>
            </div>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.content || 'Nội dung'}:</span>
              <div className="detail-modal-val" style={{ whiteSpace: 'pre-wrap' }}>{selectedDetail.text?.trim()}</div>
            </div>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.link || 'Đường dẫn'}:</span>
              <span className="detail-modal-val">
                {selectedDetail.link ? (
                  <a href={selectedDetail.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                    {selectedDetail.link}
                  </a>
                ) : '---'}
              </span>
            </div>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.scope || 'Phạm vi'}:</span>
              <span className="detail-modal-val">{selectedDetail.scope}</span>
            </div>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.displayType || 'Hiển thị'}:</span>
              <span className="detail-modal-val">{selectedDetail.display} ({selectedDetail.type})</span>
            </div>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.createdBy || 'Người tạo'}:</span>
              <span className="detail-modal-val">
                {selectedDetail.createdBy ? `${selectedDetail.createdBy.email} (${selectedDetail.createdBy.role})` : '---'}
              </span>
            </div>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.updatedBy || 'Người sửa'}:</span>
              <span className="detail-modal-val">
                {selectedDetail.updatedBy ? `${selectedDetail.updatedBy.email} (${selectedDetail.updatedBy.role})` : '---'}
              </span>
            </div>

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.time || 'Thời gian'}:</span>
              <span className="detail-modal-val">
                {selectedDetail.startAt && <div>{s.from || 'Từ'}: {formatDate(selectedDetail.startAt)}</div>}
                {selectedDetail.endAt && <div>{s.to || 'Đến'}: {formatDate(selectedDetail.endAt)}</div>}
                {!selectedDetail.startAt && !selectedDetail.endAt && <div>{s.forever || 'Vĩnh viễn'}</div>}
              </span>
            </div>

            {(selectedDetail.isDeleted || selectedDetail.deletedAt) && (
              <div className="detail-modal-row">
                <span className="detail-modal-label">{s.deletedAt || 'Thời gian xóa'}:</span>
                <span className="detail-modal-val" style={{ color: '#ef4444' }}>
                  {formatDate(selectedDetail.deletedAt)}
                </span>
              </div>
            )}

            <div className="detail-modal-row">
              <span className="detail-modal-label">{s.status || 'Trạng thái'}:</span>
              <span className="detail-modal-val" style={{ color: selectedDetail.isActive ? '#10b981' : '#6b7280', fontWeight: 'bold' }}>
                {selectedDetail.isActive ? (s.active || 'Active') : (s.draft || 'Draft')}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn-secondary" onClick={() => setSelectedDetail(null)}>
                {t.common.close || 'Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Centered Date Time Picker Modal */}
      {activeDatePickerField && (
        <div className="detail-modal-overlay" onClick={() => setActiveDatePickerField(null)}>
          <div className="detail-modal-card datepicker-modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="datepicker-modal-title">
              {activeDatePickerField === 'startAt' ? (s.startDate || 'Ngày bắt đầu') : (s.endDate || 'Ngày kết thúc')}
            </h3>

            <div className="datepicker-grid">
              <div>
                <label className="datepicker-label">Ngày</label>
                <select value={tempDate.day} onChange={e => setTempDate({ ...tempDate, day: e.target.value })} className="datepicker-select">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="datepicker-label">Tháng</label>
                <select value={tempDate.month} onChange={e => setTempDate({ ...tempDate, month: e.target.value })} className="datepicker-select">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="datepicker-label">Năm</label>
                <select value={tempDate.year} onChange={e => setTempDate({ ...tempDate, year: e.target.value })} className="datepicker-select">
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="datepicker-grid time-grid">
              <div>
                <label className="datepicker-label">Giờ</label>
                <select value={tempDate.hour} onChange={e => setTempDate({ ...tempDate, hour: e.target.value })} className="datepicker-select">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="datepicker-label">Phút</label>
                <select value={tempDate.minute} onChange={e => setTempDate({ ...tempDate, minute: e.target.value })} className="datepicker-select">
                  {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="datepicker-label">AM/PM</label>
                <select value={tempDate.ampm} onChange={e => setTempDate({ ...tempDate, ampm: e.target.value })} className="datepicker-select">
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            <div className="datepicker-actions-footer">
              <button type="button" className="btn-secondary" onClick={() => setActiveDatePickerField(null)}>Hủy</button>
              <button type="button" className="btn-primary" onClick={handleSaveTempDate}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
