import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DownloadsState {
  downloadedCourseIds: string[];
  addDownload: (courseId: string) => void;
  removeDownload: (courseId: string) => void;
  isDownloaded: (courseId: string) => boolean;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloadedCourseIds: [],
      addDownload: (courseId) =>
        set((state) => ({
          downloadedCourseIds: state.downloadedCourseIds.includes(courseId)
            ? state.downloadedCourseIds
            : [...state.downloadedCourseIds, courseId],
        })),
      removeDownload: (courseId) =>
        set((state) => ({
          downloadedCourseIds: state.downloadedCourseIds.filter((id) => id !== courseId),
        })),
      isDownloaded: (courseId) => get().downloadedCourseIds.includes(courseId),
    }),
    { name: 'educandes-downloads' }
  )
);
