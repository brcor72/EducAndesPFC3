import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { COURSES } from "@/lib/courses";

export type ProgressRow = {
  id: string;
  user_id: string;
  course_id: string;
  lessons_total: number;
  lessons_done: number;
  daily_goal: number;
  last_activity_at: string;
};

const DEFAULT_TOTAL = 12;

export function useProgress() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("course_progress")
      .select("*")
      .eq("user_id", user.id);
    setRows((data as ProgressRow[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) refresh();
  }, [authLoading, refresh]);

  const getFor = (courseId: string): ProgressRow | null =>
    rows.find((r) => r.course_id === courseId) ?? null;

  const setLessonsDone = async (courseId: string, lessonsDone: number) => {
    if (!user) return;
    const existing = getFor(courseId);
    const total = existing?.lessons_total ?? DEFAULT_TOTAL;
    const safe = Math.max(0, Math.min(total, lessonsDone));
    if (existing) {
      const { data } = await supabase
        .from("course_progress")
        .update({ lessons_done: safe, last_activity_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      if (data) setRows((r) => r.map((x) => (x.id === data.id ? (data as ProgressRow) : x)));
    } else {
      const { data } = await supabase
        .from("course_progress")
        .insert({
          user_id: user.id,
          course_id: courseId,
          lessons_total: total,
          lessons_done: safe,
          daily_goal: 1,
        })
        .select()
        .single();
      if (data) setRows((r) => [...r, data as ProgressRow]);
    }
  };

  const setDailyGoal = async (courseId: string, goal: number) => {
    if (!user) return;
    const existing = getFor(courseId);
    const safe = Math.max(1, Math.min(5, goal));
    if (existing) {
      const { data } = await supabase
        .from("course_progress")
        .update({ daily_goal: safe })
        .eq("id", existing.id)
        .select()
        .single();
      if (data) setRows((r) => r.map((x) => (x.id === data.id ? (data as ProgressRow) : x)));
    } else {
      const { data } = await supabase
        .from("course_progress")
        .insert({
          user_id: user.id,
          course_id: courseId,
          lessons_total: DEFAULT_TOTAL,
          lessons_done: 0,
          daily_goal: safe,
        })
        .select()
        .single();
      if (data) setRows((r) => [...r, data as ProgressRow]);
    }
  };

  // Aggregate stats across all courses
  const totals = rows.reduce(
    (acc, r) => {
      acc.done += r.lessons_done;
      acc.total += r.lessons_total;
      if (r.lessons_done >= r.lessons_total && r.lessons_total > 0) acc.completed += 1;
      return acc;
    },
    { done: 0, total: 0, completed: 0 },
  );

  const startedCourses = rows.length;
  const overallPct = totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0;

  return {
    user,
    authLoading,
    loading,
    rows,
    refresh,
    getFor,
    setLessonsDone,
    setDailyGoal,
    totals,
    startedCourses,
    overallPct,
    catalog: COURSES,
    DEFAULT_TOTAL,
  };
}

/** Estimate remaining days to finish lessons at a given pace (lessons/day). */
export function estimateDays(remaining: number, perDay: number): number {
  if (perDay <= 0) return Infinity;
  return Math.ceil(remaining / perDay);
}
