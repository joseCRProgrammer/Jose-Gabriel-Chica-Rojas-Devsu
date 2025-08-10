import { EditIntentService } from './edit-intent.service';

describe('EditIntentService', () => {
  let svc: EditIntentService;

  beforeEach(() => {
    svc = new EditIntentService();
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
});
