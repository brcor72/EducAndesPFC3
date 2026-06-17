import api from './api';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string[];
}

export interface PracticeResponse {
  message: string;
  isCompleted: boolean;
}

export const aiService = {
  async runPractice(lessonId: string, history: ChatMessage[]): Promise<PracticeResponse> {
    const { data } = await api.post('/ai/practice', { lessonId, history });
    return data.data;
  },
};
