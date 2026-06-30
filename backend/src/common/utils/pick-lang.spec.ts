import { pickLang, applyLangToLesson, applyLangToCourse } from './pick-lang';

describe('pickLang', () => {
  it('devuelve el campo en español tal cual cuando lang=es', () => {
    expect(pickLang({ title: 'Hola' }, 'title', 'es')).toBe('Hola');
  });

  it('usa la traducción cuando existe (qu)', () => {
    expect(pickLang({ title: 'Hola', titleQu: 'Napaykullayki' }, 'title', 'qu'))
      .toBe('Napaykullayki');
  });

  it('cae al español si falta la traducción', () => {
    expect(pickLang({ title: 'Hola' }, 'title', 'qu')).toBe('Hola');
  });

  it('devuelve cadena vacía si no hay ningún valor', () => {
    expect(pickLang({}, 'title', 'qu')).toBe('');
  });
});

describe('applyLangToLesson', () => {
  it('no modifica la lección cuando lang=es', () => {
    const lesson = { title: 'T', summary: 'S', detail: 'D' };
    expect(applyLangToLesson(lesson, 'es')).toBe(lesson);
  });

  it('traduce title, summary y detail al idioma elegido', () => {
    const lesson = {
      title: 'T', titleQu: 'Tq',
      summary: 'S', summaryQu: 'Sq',
      detail: 'D', detailQu: 'Dq',
    };
    const out = applyLangToLesson(lesson, 'qu');
    expect(out.title).toBe('Tq');
    expect(out.summary).toBe('Sq');
    expect(out.detail).toBe('Dq');
  });
});

describe('applyLangToCourse', () => {
  it('traduce el curso y sus lecciones anidadas', () => {
    const course = {
      title: 'C', titleQu: 'Cq',
      short: 'Sh', shortQu: 'Shq',
      lessons: [{ title: 'L', titleQu: 'Lq', summary: '', detail: '' }],
    };
    const out = applyLangToCourse(course, 'qu');
    expect(out.title).toBe('Cq');
    expect(out.lessons[0].title).toBe('Lq');
  });
});
