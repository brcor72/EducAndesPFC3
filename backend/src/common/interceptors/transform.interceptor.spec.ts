import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

function callHandler(value: any) {
  return { handle: () => of(value) };
}

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('envuelve datos simples en { data, meta }', async () => {
    const result$ = interceptor.intercept({} as any, callHandler({ id: 1 }) as any);
    const result = await lastValueFrom(result$);
    expect(result.data).toEqual({ id: 1 });
    expect(result.meta).toHaveProperty('timestamp');
  });

  it('no vuelve a envolver una respuesta que ya trae data y meta', async () => {
    const paginated = { data: [1, 2], meta: { total: 2 } };
    const result$ = interceptor.intercept({} as any, callHandler(paginated) as any);
    const result = await lastValueFrom(result$);
    expect(result).toBe(paginated);
  });
});
