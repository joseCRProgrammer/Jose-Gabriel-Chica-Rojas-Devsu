import { EditIntentService } from './edit-intent.service';

describe('EditIntentService', () => {
  let svc: EditIntentService;

  const originalCrypto = globalThis.crypto;

  beforeEach(() => {
    svc = new EditIntentService();
    jest.spyOn(Date, 'now').mockRestore();
    globalThis.crypto = originalCrypto as any;
  });

  it('allowOnce y validateAndConsume: éxito y consumo único', () => {
    const token = svc.allowOnce('abc');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);

    expect(svc.validateAndConsume('abc', token)).toBe(true);
    expect(svc.validateAndConsume('abc', token)).toBe(false);
  });

  it('falla si id no coincide', () => {
    const token = svc.allowOnce('abc');
    expect(svc.validateAndConsume('xyz', token)).toBe(false);
  });

  it('falla si token vacío/null', () => {
    expect(svc.validateAndConsume('abc', '')).toBe(false);
    expect(svc.validateAndConsume('abc', undefined)).toBe(false);
  });


  it('expira por TTL: al pasar del tiempo, validateAndConsume devuelve false', () => {
    const base = 1_000_000;
    const nowSpy = jest.spyOn(Date, 'now');

    nowSpy.mockReturnValue(base);
    const token = svc.allowOnce('abc');

    nowSpy.mockReturnValue(base + 60_001);
    expect(svc.validateAndConsume('abc', token)).toBe(false);
  });

  it('consume incluso en mismatch de id: tras un intento fallido no se puede reusar', () => {
    const token = svc.allowOnce('real-id');

    expect(svc.validateAndConsume('other-id', token)).toBe(false);

    expect(svc.validateAndConsume('real-id', token)).toBe(false);
  });

  it('token inexistente (desconocido) siempre false (dos intentos)', () => {
    expect(svc.validateAndConsume('abc', 'no-such-token')).toBe(false);
    expect(svc.validateAndConsume('abc', 'no-such-token')).toBe(false);
  });

  it('cryptoRandom (rama con crypto.getRandomValues): genera 16 bytes → 32 hex chars', () => {
    const arr: number[] = Array.from({ length: 16 }, (_, i) => i); 
    globalThis.crypto = {
      getRandomValues: (buf: Uint8Array) => {
        buf.set(Uint8Array.from(arr));
        return buf;
      },
    } as unknown as Crypto;

    const token = svc.allowOnce('abc');
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });

  it('cryptoRandom fallback (sin crypto): genera string alfanumérica suficientemente larga', () => {
    globalThis.crypto = undefined;

    const token = svc.allowOnce('abc');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(15);
  });
});
