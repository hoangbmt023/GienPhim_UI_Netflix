import api from './api';

export const contactApi = {
  // User gửi liên hệ
  submitTicket: (data) => api.post('/api/contact', data),

  // User xem ticket của mình
  getMyTickets: (params) => api.get('/api/contact/my', { params }),

  // Moderator/Admin lấy tất cả ticket
  getAllTickets: (params) => api.get('/api/contact', { params }),

  // Moderator/Admin xem chi tiết ticket
  getTicketById: (ticketId) => api.get(`/api/contact/${ticketId}`),

  // Moderator/Admin cập nhật trạng thái
  updateStatus: (ticketId, status) => api.patch(`/api/contact/${ticketId}/status`, { status }),

  // Moderator/Admin phản hồi ticket
  replyTicket: (ticketId, reply) => api.post(`/api/contact/${ticketId}/reply`, { reply }),

  // Moderator/Admin đóng ticket
  closeTicket: (ticketId) => api.patch(`/api/contact/${ticketId}/close`),

  // User phản hồi ticket
  userReplyTicket: (ticketId, message) => api.post(`/api/contact/${ticketId}/user-reply`, { message }),

  // User tự đóng ticket
  userCloseTicket: (ticketId) => api.patch(`/api/contact/${ticketId}/user-close`),
};
