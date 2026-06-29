import api from './api';

export const coursesService = {
  async getAll(category?: string) {
    const params = category ? { category } : {};
    const { data } = await api.get('/courses', { params });
    return data.data as any[];
  },

  async getWithProgress() {
    const { data } = await api.get('/courses/with-progress');
    return data.data as any[];
  },

  async getOne(slug: string) {
    const { data } = await api.get(`/courses/${slug}`);
    return data.data;
  },

  async getLessons(courseId: string) {
    const { data } = await api.get(`/courses/${courseId}/lessons`);
    return data.data as any[];
  },

  async getLesson(courseId: string, index: number) {
    const { data } = await api.get(`/courses/${courseId}/lessons/${index}`);
    return data.data;
  },

  async submitQuiz(courseId: string, lessonId: string, questionId: string, selectedAnswer: number) {
    const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/quiz/submit`, {
      questionId,
      selectedAnswer,
    });
    return data.data;
  },
};

export const progressService = {
  async getMyProgress() {
    const { data } = await api.get('/progress');
    return data.data;
  },

  async updateProgress(courseId: string, lessonsDone: number, dailyGoal?: number) {
    const { data } = await api.post(`/progress/${courseId}`, { lessonsDone, dailyGoal });
    return data.data;
  },
};

export const forumsService = {
  async getThreads(courseId: string, page = 1, limit = 20) {
    const { data } = await api.get(`/forums/courses/${courseId}/threads`, {
      params: { page, limit },
    });
    return data.data;
  },

  async createThread(courseId: string, title: string, body: string) {
    const { data } = await api.post(`/forums/courses/${courseId}/threads`, { title, body });
    return data.data;
  },

  async getReplies(threadId: string) {
    const { data } = await api.get(`/forums/threads/${threadId}/replies`);
    return data.data;
  },

  async createReply(threadId: string, body: string) {
    const { data } = await api.post(`/forums/threads/${threadId}/replies`, { body });
    return data.data;
  },

  async deleteThread(id: string) {
    const { data } = await api.delete(`/forums/threads/${id}`);
    return data.data;
  },
};

export const notificationsService = {
  async getAll(page = 1) {
    const { data } = await api.get('/notifications', { params: { page } });
    return data.data;
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count');
    return data.data.count as number;
  },

  async markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await api.patch('/notifications/read-all');
  },
};

export const dashboardService = {
  async getStudentDashboard() {
    const { data } = await api.get('/dashboard/student');
    return data.data;
  },

  async getAdminStats() {
    const { data } = await api.get('/dashboard/admin');
    return data.data;
  },
};

export const usersService = {
  async getAll(page = 1, limit = 20, search?: string, role?: string) {
    const { data } = await api.get('/users', { params: { page, limit, search, role } });
    return data;
  },

  async getOne(id: string) {
    const { data } = await api.get(`/users/${id}`);
    return data.data;
  },

  async update(id: string, payload: any) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.data;
  },

  async getStats() {
    const { data } = await api.get('/users/me/stats');
    return data.data;
  },

  async generateAvatar(): Promise<string> {
    const { data } = await api.post('/users/me/generate-avatar');
    return data;
  },
};
