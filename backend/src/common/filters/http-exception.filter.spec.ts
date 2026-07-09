import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function makeHost(url = '/api/test', method = 'GET') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host: any = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url, method }),
    }),
  };
  return { host, status, json };
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('respeta el status code de una HttpException', () => {
    const { host, status, json } = makeHost();
    filter.catch(new HttpException('No encontrado', HttpStatus.NOT_FOUND), host);

    expect(status).toHaveBeenCalledWith(404);
    const body = json.mock.calls[0][0];
    expect(body.statusCode).toBe(404);
    expect(body.path).toBe('/api/test');
  });

  it('convierte un error desconocido en 500 genérico', () => {
    const { host, status, json } = makeHost();
    filter.catch(new Error('boom'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0];
    expect(body.message).toBe('Error interno del servidor');
  });

  it('incluye timestamp y método en la respuesta', () => {
    const { host, json } = makeHost('/x', 'POST');
    filter.catch(new HttpException('x', 400), host);
    const body = json.mock.calls[0][0];
    expect(body.method).toBe('POST');
    expect(typeof body.timestamp).toBe('string');
  });
});
