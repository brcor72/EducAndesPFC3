/**
 * Returns the translated version of a field if available, falling back to Spanish.
 * e.g. pickLang(lesson, 'title', 'qu') → lesson.titleQu ?? lesson.title
 */
export function pickLang<T extends Record<string, any>>(
  obj: T,
  field: string,
  lang: string,
): string {
  if (lang === 'es') return obj[field] ?? '';
  const suffix = lang.charAt(0).toUpperCase() + lang.slice(1);
  return obj[`${field}${suffix}`] ?? obj[field] ?? '';
}

export function applyLangToLesson(lesson: any, lang: string) {
  if (lang === 'es') return lesson;
  return {
    ...lesson,
    title:   pickLang(lesson, 'title',   lang),
    summary: pickLang(lesson, 'summary', lang),
    detail:  pickLang(lesson, 'detail',  lang),
  };
}

export function applyLangToCourse(course: any, lang: string) {
  if (lang === 'es') return course;
  return {
    ...course,
    title: pickLang(course, 'title', lang),
    short: pickLang(course, 'short', lang),
    lessons: course.lessons?.map((l: any) => applyLangToLesson(l, lang)),
  };
}
