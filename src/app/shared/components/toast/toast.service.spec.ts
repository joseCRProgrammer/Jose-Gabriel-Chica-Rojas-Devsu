import { ToastService } from './toast.service';

jest.useFakeTimers();

describe('ToastService', () => {
  let svc: ToastService;

  beforeEach(() => {
    svc = new ToastService();
  });

  it('agrega y autoremueve un toast', () => {
    expect(svc.messages().length).toBe(0);
    svc.success('ok', 10);

    expect(svc.messages().length).toBe(1);
    jest.advanceTimersByTime(11);
    expect(svc.messages().length).toBe(0);
  });

  it('remove elimina por id', () => {
    svc.info('a', 0);
    svc.info('b', 0);
    const [a, b] = svc.messages();
    svc.remove(a.id);
    expect(svc.messages().map(t => t.message)).toEqual(['b']);
  });
});
