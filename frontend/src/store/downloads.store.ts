import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DownloadsState {
  userDownloads: Record<string, string[]>;
  offlineCourses: Record<string, any>;
  addDownload: (userId: string, course: any) => void;
  removeDownload: (userId: string, courseId: string) => void;
  isDownloaded: (userId: string, courseId: string) => boolean;
  getDownloads: (userId: string) => string[];
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      userDownloads: {},
      offlineCourses: {},
      addDownload: (userId, course) =>
        set((state) => {
          const courseId = course.slug;
          const userList = state.userDownloads[userId] || [];
          if (userList.includes(courseId)) {
            // Already downloaded, just update the cache
            return {
              offlineCourses: {
                ...state.offlineCourses,
                [courseId]: course,
              }
            };
          }
          return {
            userDownloads: {
              ...state.userDownloads,
              [userId]: [...userList, courseId],
            },
            offlineCourses: {
              ...state.offlineCourses,
              [courseId]: course,
            }
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
