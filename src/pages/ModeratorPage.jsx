import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { contactApi } from '@/services/contactApi';
import { getPath, useLang } from '@/utils/lang';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Send, X, Shield, Filter, Edit2, Bold, Italic, Type, Link, List, Quote, Eye, HelpCircle } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import StatusModal from '@/components/StatusModal/StatusModal';
import './ModeratorPage.css';

const STATUS_CONFIG = {
  OPEN: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: AlertCircle },
  IN_PROGRESS: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
  REPLIED: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle },
  CLOSED: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: XCircle },
};

export default function ModeratorPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    document.title = `${t.tickets.modTitle} - GienPhim`;
  }, [t.tickets.modTitle]);
  const getStatusLabel = (status) => {
    switch (status) {
      case 'OPEN': return t.tickets.statusOpen;
      case 'IN_PROGRESS': return t.tickets.statusInProgress;
      case 'REPLIED': return t.tickets.statusReplied;
      case 'CLOSED': return t.tickets.statusClosed;
      default: return status;
    }
  };
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Modals
  const [pendingTicket, setPendingTicket] = useState(null);
  const [confirmTicketOpen, setConfirmTicketOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, type: 'success', title: '', description: '' });

  const messagesEndRef = useRef(null);
  const replyFormRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate(getPath('login')); return; }
    if (!user || !['MODERATOR', 'ADMIN'].includes(user.role)) {
      navigate(getPath('home')); return;
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterStatus) params.status = filterStatus;
      const res = await contactApi.getAllTickets(params);
      if (res.data.success) {
        setTickets(res.data.data);
        setPagination({ page, total: res.data.pagination?.total || 0 });
        if (selectedTicket) {
          const updatedSelected = res.data.data.find(t => t.id === selectedTicket.id);
          if (updatedSelected) setSelectedTicket(updatedSelected);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && ['MODERATOR', 'ADMIN'].includes(user.role)) {
      fetchTickets(1);
    }
  }, [filterStatus, authLoading, isAuthenticated, user]);

  const openDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
    setShowReplyForm(false);
    setIsPreviewMode(false);
    if (ticket.status === 'OPEN') {
      try {
        await contactApi.updateStatus(ticket.id, 'IN_PROGRESS');
        setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'IN_PROGRESS' } : t));
        setSelectedTicket(prev => ({ ...prev, status: 'IN_PROGRESS' }));
      } catch (_) {}
    }
  };

  const handleTicketClick = (ticket) => {
    setPendingTicket(ticket);
    setConfirmTicketOpen(true);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await contactApi.replyTicket(selectedTicket.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
      setIsPreviewMode(false);
      await fetchTickets(pagination.page);
      setStatusModal({ open: true, type: 'success', title: t.tickets.statusSuccessTitle, description: t.tickets.replySuccessDesc || 'Đã gửi phản hồi cho người dùng.' });
    } catch (err) {
      console.error(err);
      setStatusModal({ open: true, type: 'error', title: t.tickets.statusErrorTitle, description: err.response?.data?.message || 'Lỗi khi gửi phản hồi.' });
    } finally {
      setReplying(false);
    }
  };

  const handleClose = async () => {
    if (!selectedTicket) return;
    try {
      await contactApi.updateStatus(selectedTicket.id, 'CLOSED');
      await fetchTickets(pagination.page);
      setShowReplyForm(false);
      setConfirmCloseOpen(false);
      setStatusModal({ open: true, type: 'success', title: t.tickets.statusSuccessTitle, description: 'Đã đánh dấu yêu cầu là Đã giải quyết.' });
    } catch (err) {
      console.error(err);
      setStatusModal({ open: true, type: 'error', title: t.tickets.statusErrorTitle, description: err.response?.data?.message || 'Lỗi khi đóng yêu cầu.' });
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const parseMessages = (ticket) => {
    const messages = [];
    messages.push({
      sender: ticket.name,
      text: ticket.message,
      time: ticket.createdAt,
      isUser: true
    });
    if (ticket.reply) {
      const parts = ticket.reply.split(/(?=--- Người dùng phản hồi ---|--- Phản hồi từ Hỗ trợ viên ---|--- Phản hồi từ bạn ---)/g);
      parts.forEach(part => {
        if (part.trim() === '') return;
        if (part.startsWith('--- Phản hồi từ bạn ---') || part.startsWith('--- Người dùng phản hồi ---')) {
          messages.push({
            sender: ticket.name,
            text: part.replace(/--- Phản hồi từ bạn ---\n|--- Người dùng phản hồi ---\n/g, '').trim(),
            time: ticket.updatedAt, isUser: true
          });
        } else if (part.startsWith('--- Phản hồi từ Hỗ trợ viên ---')) {
          messages.push({
            sender: 'GienPhim Operator',
            text: part.replace('--- Phản hồi từ Hỗ trợ viên ---\n', '').trim(),
            time: ticket.repliedAt || ticket.updatedAt, isUser: false
          });
        } else {
          messages.push({
            sender: 'GienPhim Operator',
            text: part.trim(),
            time: ticket.repliedAt || ticket.updatedAt, isUser: false
          });
        }
      });
    }
    return messages;
  };

  const openReplyForm = () => {
    setShowReplyForm(true);
    setIsPreviewMode(false);
    setTimeout(() => {
      replyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      textAreaRef.current?.focus();
    }, 100);
  };

  const insertTextAtCursor = (prefix, suffix = '') => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = replyText;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    const newSelected = selected || (suffix ? 'text' : '');
    setReplyText(before + prefix + newSelected + suffix + after);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + newSelected.length);
    }, 0);
  };

  const renderMarkdown = (text) => {
    if (!text) return <span style={{color: '#666'}}>{t.tickets.noContent || 'Không có nội dung...'}</span>;
    let html = text
      .replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br/>');
    html = html.replace(/(<li>.*?<\/li>(<br\/>)?)+/g, match => `<ul>${match.replace(/<br\/>/g, '')}</ul>`);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const totalPages = Math.ceil(pagination.total / 20);

  if (authLoading) return null;

  return (
    <>
    <div className="mod-page">
      <div className="mod-container">
        <div className="mod-header-section">
          <div className="mod-header-left">
            <h1 className="mod-title">{t.tickets.modTitle}</h1>
            <span className="mod-role-badge">
              <Shield size={14} style={{ marginRight: 4 }} />
              {t.tickets.modRole}
            </span>
          </div>
          <div className="mod-filters">
            <Filter size={16} color="#888" />
            {['', 'OPEN', 'IN_PROGRESS', 'REPLIED', 'CLOSED'].map(s => (
              <button
                key={s}
                className={`mod-filter-btn ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s === '' ? (t.tickets.filterAll || 'Tất cả') : getStatusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="mod-layout">
          {/* List Section */}
          <div className="mod-sidebar">
            <div className="mod-list-header">
              {t.tickets.modListHeader} ({pagination.total})
            </div>
            <div className="mod-ticket-list">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <div key={i} className="mod-ticket-skeleton" />)
              ) : tickets.length === 0 ? (
                <div className="mod-empty-state">
                  <MessageSquare size={48} opacity={0.2} />
                  <p>{t.tickets.emptyState}</p>
                </div>
              ) : tickets.map(ticket => {
                const StatusIcon = STATUS_CONFIG[ticket.status]?.icon || MessageSquare;
                return (
                  <div
                    key={ticket.id}
                    className={`mod-ticket-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                    onClick={() => {
                      if (ticket.status === 'OPEN') {
                        handleTicketClick(ticket);
                      } else {
                        openDetail(ticket);
                      }
                    }}
                  >
                    <div className="item-status-bar" style={{ backgroundColor: STATUS_CONFIG[ticket.status]?.color }}></div>
                    <div className="item-content">
                      <div className="item-top">
                        <span className="item-id">#{ticket.id.slice(0, 8)}</span>
                        <span className="item-date">{formatDate(ticket.createdAt).split(' ')[0]}</span>
                      </div>
                      <h4 className="item-subject">{ticket.subject}</h4>
                      <p className="item-user">{ticket.name}</p>
                      <div className="item-bottom">
                        <span className="item-badge" style={{ 
                          color: STATUS_CONFIG[ticket.status]?.color, 
                          backgroundColor: STATUS_CONFIG[ticket.status]?.bg 
                        }}>
                          <StatusIcon size={12} style={{ marginRight: 4 }} />
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {totalPages > 1 && (
              <div className="mod-pagination">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`mod-page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                    onClick={() => fetchTickets(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail Section */}
          <div className="mod-main">
            {!selectedTicket ? (
              <div className="mod-no-selection">
                <MessageSquare size={64} opacity={0.1} />
                <h3>{t.tickets.modNoSelection}</h3>
                <p>{t.tickets.modNoSelectionDesc}</p>
              </div>
            ) : (
              <div className="ticket-detail-wrapper">
                
                {/* Forum Header */}
                <div className="ticket-forum-header">
                  <div className="forum-header-top">
                    <h2 className="forum-title">
                      {t.tickets.listTitle} <span className="forum-id">#{selectedTicket.id.slice(0, 8).toUpperCase()}</span>
                    </h2>
                    <div className="forum-actions">
                      {selectedTicket.status !== 'CLOSED' && (
                        <>
                          <button className="forum-btn forum-btn-reply" onClick={openReplyForm}>
                            <Edit2 size={14} /> {t.tickets.reply}
                          </button>
                          <button className="forum-btn forum-btn-close" onClick={() => setConfirmCloseOpen(true)}>
                            <X size={14} /> {t.tickets.close}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="forum-subtitle">
                    {t.tickets.subject}: {selectedTicket.subject}
                  </div>
                </div>

                <div className="ticket-posts">
                  {parseMessages(selectedTicket).map((msg, idx) => (
                    <div key={idx} className="ticket-post">
                      <div className="post-header">
                        <div className="post-meta">
                          {t.tickets.postedBy} <strong>{msg.sender}</strong> {t.tickets.on} {formatDate(msg.time)}
                        </div>
                        <div className={`post-badge ${msg.isUser ? 'owner' : 'operator'}`}>
                          {msg.isUser ? t.tickets.owner : t.tickets.operator}
                        </div>
                      </div>
                      <div className="post-body">
                        {renderMarkdown(msg.text)}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {showReplyForm && selectedTicket.status !== 'CLOSED' && (
                  <div className="reply-form-section" ref={replyFormRef}>
                    <div className="reply-form-header">{t.tickets.reply}</div>
                    <div className="reply-form-body">
                      <div className="form-row">
                        <div className="form-col">
                          <label>{t.tickets.name}</label>
                          <input type="text" readOnly value={selectedTicket.name} className="readonly-input" />
                        </div>
                        <div className="form-col">
                          <label>{t.tickets.email}</label>
                          <input type="text" readOnly value={selectedTicket.email} className="readonly-input" />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-col full-width">
                          <label>{t.tickets.message}</label>
                          <div className="rich-text-container">
                            <div className="rich-text-toolbar">
                              <div className="toolbar-group">
                                <button title="Bold" onClick={() => insertTextAtCursor('**', '**')}><Bold size={14} /></button>
                                <button title="Italic" onClick={() => insertTextAtCursor('*', '*')}><Italic size={14} /></button>
                                <button title="Heading" onClick={() => insertTextAtCursor('### ', '')}><Type size={14} /></button>
                              </div>
                              <div className="toolbar-group">
                                <button title="Link" onClick={() => insertTextAtCursor('[', '](url)')}><Link size={14} /></button>
                              </div>
                              <div className="toolbar-group">
                                <button title="List" onClick={() => insertTextAtCursor('- ', '')}><List size={14} /></button>
                                <button title="Quote" onClick={() => insertTextAtCursor('> ', '')}><Quote size={14} /></button>
                              </div>
                              <div className="toolbar-group">
                                <button className={`preview-btn ${isPreviewMode ? 'active' : ''}`} onClick={() => setIsPreviewMode(!isPreviewMode)}>
                                  {isPreviewMode ? <><Edit2 size={14} style={{marginRight:4}}/> {t.tickets.edit}</> : <><Eye size={14} style={{marginRight:4}}/> {t.tickets.preview}</>}
                                </button>
                                <button title="Help"><HelpCircle size={14} /></button>
                              </div>
                            </div>

                            {isPreviewMode ? (
                              <div className="preview-mode-content">
                                {renderMarkdown(replyText)}
                              </div>
                            ) : (
                              <textarea 
                                ref={textAreaRef}
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                rows="8"
                              ></textarea>
                            )}

                            <div className="rich-text-footer">
                              <span>{t.tickets.lines}: {replyText ? replyText.split('\n').length : 0}</span>
                              <span>{t.tickets.words}: {replyText.trim() ? replyText.trim().split(/\s+/).length : 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="reply-form-actions">
                        <button className="btn-submit" onClick={handleReply} disabled={!replyText.trim() || replying}>
                          <Send size={14} style={{marginRight: 6}} />
                          {replying ? t.tickets.sending : t.tickets.send}
                        </button>
                        <button className="btn-cancel" onClick={() => setShowReplyForm(false)}>
                          {t.tickets.cancel}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!showReplyForm && selectedTicket.status === 'CLOSED' && (
                  <div className="closed-notice">
                    <XCircle size={18} /> {t.tickets.closedNotice}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Confirm xem ticket */}
      <ConfirmModal
        isOpen={confirmTicketOpen}
        onClose={() => setConfirmTicketOpen(false)}
        title={t.tickets.modConfirmTitle}
        description={pendingTicket ? `${t.tickets.modConfirmDesc} #${pendingTicket.id.slice(0, 8).toUpperCase()} từ ${pendingTicket.name}?` : ''}
        confirmText={t.tickets.modConfirmBtn}
        cancelText={t.tickets.cancel}
        onConfirm={() => {
          setConfirmTicketOpen(false);
          if (pendingTicket) openDetail(pendingTicket);
        }}
      />

      {/* Confirm đóng ticket */}
      <ConfirmModal
        isOpen={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        title={t.tickets.confirmCloseTitle}
        description={t.tickets.confirmCloseDesc}
        confirmText={t.tickets.confirmCloseBtn}
        cancelText={t.tickets.cancel}
        onConfirm={handleClose}
        confirmButtonClass="modal-btn-danger"
      />

      {/* Status modal */}
      <StatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal(s => ({ ...s, open: false }))}
        type={statusModal.type}
        title={statusModal.title}
        description={statusModal.description}
      />
    </>
  );
}
