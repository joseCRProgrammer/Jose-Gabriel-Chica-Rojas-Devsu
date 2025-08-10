import { ok, err, isOk, isErr } from './result';

describe('result helpers', () => {
  it('ok factory', () => {
    const r = ok(123);
    expect(isOk(r)).toBe(true);
    expect(r.value).toBe(123);
  });

  it('err factory', () => {
    const r = err('boom');
    expect(isErr(r)).toBe(true);
    expect(r.error).toBe('boom');
  });
});
