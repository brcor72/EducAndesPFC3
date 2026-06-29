import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DownloadsState {
  userDownloads: Record<string, string[]>;
  addDownload: (userId: string, courseId: string) => void;
  removeDownload: (userId: string, courseId: string) => void;
  isDownloaded: (userId: string, courseId: string) => boolean;
  getDownloads: (userId: string) => string[];
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      userDownloads: {},
      addDownload: (userId, courseId) =>
        set((state) => {
          const userList = state.userDownloads[userId] || [];
          if (userList.includes(courseId)) return state;
          return {
            userDownloads: {
              ...state.userDownloads,
              [userId]: [...userList, courseId],
            },
          };
        }),
      removeDownload: (userId, courseId) =>
        set((state) => {
          const userList = state.userDownloads[userId] || [];
          return {
            userDownloads: {
              ...state.userDownloads,
              [userId]: userList.filter((id) => id !== courseId),
            },
          };
        }),
      isDownloaded: (userId, courseId) => {
        const userList = get().userDownloads[userId] || [];
        return userList.includes(courseId);
      },
      getDownloads: (userId) => get().userDownloads[userId] || [],
    }),
    { name: 'educandes-downloads' }
  )
);
