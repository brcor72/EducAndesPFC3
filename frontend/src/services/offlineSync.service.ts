import { coursesService, progressService } from './courses.service';

interface OfflineAction {
  id: string;
  type: 'submitQuiz' | 'updateProgress';
  payload: any;
  timestamp: number;
}

export const offlineSyncService = {
  getQueue(): OfflineAction[] {
    try {
      const q = localStorage.getItem('educandes-offline-queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  },

  setQueue(queue: OfflineAction[]) {
    localStorage.setItem('educandes-offline-queue', JSON.stringify(queue));
  },

  enqueueQuizSubmission(courseId: string, lessonId: string, questionId: string, selectedAnswer: number) {
    const queue = this.getQueue();
    queue.push({
      id: Math.random().toString(36).substring(7),
      type: 'submitQuiz',
      payload: { courseId, lessonId, questionId, selectedAnswer },
      timestamp: Date.now(),
    });
    this.setQueue(queue);
  },

  enqueueProgressUpdate(courseId: string, lessonsDone: number, dailyGoal?: number) {
    const queue = this.getQueue();
    // Overwrite previous progress update for same course if any
    const filtered = queue.filter(
      (a) => !(a.type === 'updateProgress' && a.payload.courseId === courseId)
    );
    filtered.push({
      id: Math.random().toString(36).substring(7),
      type: 'updateProgress',
      payload: { courseId, lessonsDone, dailyGoal },
      timestamp: Date.now(),
    });
    this.setQueue(filtered);
  },

  async syncAll() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log('[OfflineSync] Sincronizando', queue.length, 'acciones pendientes...');
    const failedQueue: OfflineAction[] = [];

    for (const action of queue) {
      try {
        if (action.type === 'submitQuiz') {
          const { courseId, lessonId, questionId, selectedAnswer } = action.payload;
          await coursesService.submitQuiz(courseId, lessonId, questionId, selectedAnswer);
        } else if (action.type === 'updateProgress') {
          const { courseId, lessonsDone, dailyGoal } = action.payload;
          await progressService.updateProgress(courseId, lessonsDone, dailyGoal);
        }
      } catch (err) {
        console.error('[OfflineSync] Error sincronizando accion:', action, err);
        // If it failed due to server error or still offline, keep in queue
        failedQueue.push(action);
      }
    }

    this.setQueue(failedQueue);
    if (failedQueue.length === 0) {
      console.log('[OfflineSync] Sincronización completa');
    }
  },
};
