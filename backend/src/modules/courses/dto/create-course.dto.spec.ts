import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCourseDto } from './create-course.dto';

async function errorsFor(payload: Record<string, any>) {
  const dto = plainToInstance(CreateCourseDto, payload);
  return validate(dto);
}

describe('CreateCourseDto', () => {
  const base = {
    slug: 'ganaderia',
    title: 'Ganadería inteligente',
    short: 'Resumen corto',
    long: 'Descripción larga del curso',
    level: 'INICIAL',
    durationWeeks: 4,
    category: 'CAMPO',
  };

  it('acepta un curso válido', async () => {
    expect(await errorsFor(base)).toHaveLength(0);
  });

  it('rechaza un nivel fuera del enum', async () => {
    const errors = await errorsFor({ ...base, level: 'EXPERTO' });
    expect(errors.some((e) => e.property === 'level')).toBe(true);
  });

  it('rechaza una duración fuera del rango 1-52', async () => {
    const errors = await errorsFor({ ...base, durationWeeks: 99 });
    expect(errors.some((e) => e.property === 'durationWeeks')).toBe(true);
  });

  it('rechaza una categoría inválida', async () => {
    const errors = await errorsFor({ ...base, category: 'OTRA' });
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });
});
