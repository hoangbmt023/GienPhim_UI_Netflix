import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { contactApi } from '@/services/contactApi';
import { getPath, useLang } from '@/utils/lang';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Edit2, X, Send, Bold, Italic, Type, Link, List, Quote, Eye, HelpCircle, Plus } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal';
import StatusModal from '@/components/StatusModal/StatusModal';
import './MyTicketsPage.css';

const STATUS_CONFIG = {
  OPEN: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: AlertCircle },
  IN_PROGRESS: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock },
  REPLIED: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: CheckCircle },
  CLOSED: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: XCircle },
};

export default function MyTicketsPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    document.title = `${t.tickets.historyTitle} - GienPhim`;
  }, [t.tickets.historyTitle]);

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
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Modals
  const [confirmClose, setConfirmClose] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, type: 'success', title: '', description: '' });

  const messagesEndRef = useRef(null);
  const replyFormRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { navigate(getPath('login')); return; }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchTickets = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactApi.getMyTickets({ page: 1, limit: 100 });
      if (res.data.success) {
        setTickets(res.data.data);
        setSelectedTicket(prev => {
          if (!prev) return null;
          return res.data.data.find(t => t.id === prev.id) || prev;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchTickets();
  }, [authLoading, isAuthenticated, fetchTickets]);

  const formatDate = (d) => new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setIsReplying(true);
    try {
      await contactApi.userReplyTicket(selectedTicket.id, replyText);
      setReplyText('');
      setShowReplyForm(false);
      setIsPreviewMode(false);
      await fetchTickets();
      setStatusModal({ 
        open: true, 
        type: 'success', 
        title: t.tickets.statusSuccessTitle, 
        description: 'Phản hồi của bạn đã được gửi. Hỗ trợ viên sẽ sớm liên hệ lại.' 
      });
    } catch (err) {
      console.error(err);
      setStatusModal({ 
        open: true, 
        type: 'error', 
        title: t.tickets.statusErrorTitle, 
        description: err.response?.data?.message || 'Có lỗi xảy ra khi gửi phản hồi.' 
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    setIsClosing(true);
    try {
      await contactApi.userCloseTicket(selectedTicket.id);
      await fetchTickets();
      setShowReplyForm(false);
      setStatusModal({ 
        open: true, 
        type: 'success', 
        title: t.tickets.statusSuccessTitle, 
        description: 'Yêu cầu hỗ trợ đã được đánh dấu là giải quyết.' 
      });
    } catch (err) {
      console.error(err);
      setStatusModal({ 
        open: true, 
        type: 'error', 
        title: t.tickets.statusErrorTitle, 
        description: err.response?.data?.message || 'Có lỗi xảy ra khi đóng yêu cầu.' 
      });
    } finally {
      setIsClosing(false);
      setConfirmClose(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return <span style={{ color: '#666' }}>Không có nội dung để xem trước...</span>;
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

  const parseMessages = (ticket) => {
    const messages = [];
    messages.push({
      sender: ticket.name || user?.name || t.tickets.owner,
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
            sender: ticket.name || user?.name || t.tickets.owner,
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

  if (authLoading) return null;

  return (
    <div className="mytickets-page">
      <div className="mytickets-container">
        <div className="mytickets-header-section">
          <div>
            <h1 className="mytickets-title">{t.tickets.historyTitle}</h1>
            <p className="mytickets-subtitle">{t.tickets.historySubtitle}</p>
          </div>
          <button className="mytickets-new-btn desktop-only" onClick={() => navigate(getPath('contact'))}>
            <MessageSquare size={18} />
            {t.tickets.newRequest}
          </button>
        </div>

        <div className="mytickets-layout">
          {/* List Section */}
          <div className="mytickets-sidebar">
            <div className="mytickets-list-header">
              {t.tickets.listTitle} ({tickets.length})
            </div>
            <div className="mytickets-list">
              {loading && tickets.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="mytickets-skeleton" />)
              ) : tickets.length === 0 ? (
                <div className="mytickets-empty-state">
                  <MessageSquare size={48} opacity={0.2} />
                  <p>{t.tickets.emptyState}</p>
                </div>
              ) : (
                tickets.map(ticket => {
                  const StatusIcon = STATUS_CONFIG[ticket.status]?.icon || MessageSquare;
                  return (
                    <div
                      key={ticket.id}
                      className={`mytickets-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowReplyForm(false);
                        setIsPreviewMode(false);
                      }}
                    >
                      <div className="item-status-bar" style={{ backgroundColor: STATUS_CONFIG[ticket.status]?.color }}></div>
                      <div className="item-content">
                        <div className="item-top">
                          <span className="item-id">#{ticket.id.slice(0, 8)}</span>
                          <span className="item-date">{formatDate(ticket.createdAt).split(' ')[0]}</span>
                        </div>
                        <h4 className="item-subject">{ticket.subject}</h4>
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
                })
              )}
            </div>
            {/* Mobile New Request Button */}
            <button className="mytickets-new-btn mobile-only-btn" onClick={() => navigate(getPath('contact'))}>
              <Plus size={18} />
              {t.tickets.newRequest}
            </button>
          </div>

          {/* Detail Section */}
          <div className="mytickets-main">
            {!selectedTicket ? (
              <div className="mytickets-no-selection">
                <MessageSquare size={64} opacity={0.1} />
                <h3>{t.tickets.noSelection}</h3>
                <p>{t.tickets.noSelectionDesc}</p>
              </div>
            ) : (
              <div className="ticket-detail-wrapper">

                {/* Header Style Forum */}
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
                          <button className="forum-btn forum-btn-close" onClick={() => setConfirmClose(true)} disabled={isClosing}>
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
                          <input type="text" readOnly value={selectedTicket.name || user?.name || ''} className="readonly-input" />
                        </div>
                        <div className="form-col">
                          <label>{t.tickets.email}</label>
                          <input type="text" readOnly value={selectedTicket.email || user?.email || ''} className="readonly-input" />
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
                                  {isPreviewMode ? <><Edit2 size={14} style={{ marginRight: 4 }} /> {t.tickets.edit}</> : <><Eye size={14} style={{ marginRight: 4 }} /> {t.tickets.preview}</>}
                                </button>
                                <button title="Help"><HelpCircle size={14} /></button>
                              </div>
                            </div>

                            {isPreviewMode ? (
                              <div className="preview-mode-content">{renderMarkdown(replyText)}</div>
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
                        <button className="btn-submit" onClick={handleReply} disabled={!replyText.trim() || isReplying}>
                          <Send size={14} style={{ marginRight: 6 }} />
                          {isReplying ? t.tickets.sending : t.tickets.send}
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

      {/* Confirm close modal */}
      <ConfirmModal
        isOpen={confirmClose}
        onClose={() => setConfirmClose(false)}
        title={t.tickets.confirmCloseTitle}
        description={t.tickets.confirmCloseDesc}
        confirmText={isClosing ? '...' : t.tickets.confirmCloseBtn}
        cancelText={t.tickets.cancel}
        onConfirm={handleCloseTicket}
        isLoading={isClosing}
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
    </div>
  );
}
