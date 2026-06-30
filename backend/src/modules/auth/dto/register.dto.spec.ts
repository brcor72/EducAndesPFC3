import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

async function errorsFor(payload: Record<string, any>) {
  const dto = plainToInstance(RegisterDto, payload);
  return validate(dto);
}

describe('RegisterDto', () => {
  const base = { dni: '12345678', displayName: 'María Quispe', password: 'chacra2025' };

  it('acepta un payload válido', async () => {
    expect(await errorsFor(base)).toHaveLength(0);
  });

  it('rechaza un DNI que no tenga 8 dígitos', async () => {
    const errors = await errorsFor({ ...base, dni: '123' });
    expect(errors.some((e) => e.property === 'dni')).toBe(true);
  });

  it('rechaza una contraseña sin números', async () => {
    const errors = await errorsFor({ ...base, password: 'solanletras' });
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rechaza un idioma fuera de la lista permitida', async () => {
    const errors = await errorsFor({ ...base, preferredLang: 'fr' });
    expect(errors.some((e) => e.property === 'preferredLang')).toBe(true);
  });
});
