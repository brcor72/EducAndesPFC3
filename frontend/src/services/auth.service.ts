import api from './api';

export interface RegisterPayload {
  dni: string;
  displayName: string;
  community?: string;
  password: string;
  preferredLang?: string;
}

export interface LoginPayload {
  dni: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  },

  async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload);
    const { accessToken, refreshToken, user } = data.data;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    return user;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};
