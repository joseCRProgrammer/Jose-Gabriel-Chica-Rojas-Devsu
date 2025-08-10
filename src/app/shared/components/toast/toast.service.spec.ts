import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  const read = () => service.messages();

  it('inicia sin mensajes', () => {
    expect(read()).toEqual([]);
  });

  it('show agrega un toast con id incremental y datos correctos', () => {
    service.show('success', 'ok-1', 0);
    let msgs = read();
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toMatchObject({ id: 1, type: 'success', message: 'ok-1', timeout: 0 });

    service.show('error', 'bad-2', 0);
    msgs = read();
    expect(msgs).toHaveLength(2);
    expect(msgs[1]).toMatchObject({ id: 2, type: 'error', message: 'bad-2', timeout: 0 });
  });

  it('auto-remueve el toast después del timeout especificado', () => {
    service.show('info', 'temp', 3000);
    expect(read()).toHaveLength(1);

    jest.advanceTimersByTime(2999);
    expect(read()).toHaveLength(1);

    jest.advanceTimersByTime(1);
    expect(read()).toHaveLength(0);
  });

  it('timeout = 0 no programa autoremoción', () => {
    service.show('warning', 'stay', 0);
    expect(read()).toHaveLength(1);
    jest.runOnlyPendingTimers();
    expect(read()).toHaveLength(1);
  });

  it('helpers success/error/warning/info agregan con tipo correcto', () => {
    service.success('s', 0);
    service.error('e', 0);
    service.warning('w', 0);
    service.info('i', 0);
    const types = read().map(t => t.type);
    expect(types).toEqual(['success', 'error', 'warning', 'info']);
  });

  it('remove elimina por id y deja el resto intacto', () => {
    service.show('success', 'a', 0);
    service.show('error', 'b', 0);
    service.show('info', 'c', 0);
    expect(read().map(t => t.id)).toEqual([1, 2, 3]);

    service.remove(2);
    expect(read().map(t => t.id)).toEqual([1, 3]);

    service.remove(999);
    expect(read().map(t => t.id)).toEqual([1, 3]);
  });

  it('ids siguen incrementando aunque se eliminen toasts previos', () => {
    service.show('success', 'a', 0);
    service.show('success', 'b', 0);
    service.remove(2);
    service.show('success', 'c', 0);
    const ids = read().map(t => t.id);
    expect(ids).toContain(3);
  });

  it('show usa timeout por defecto (3000) cuando no se provee', () => {
  service.show('info', 'default-timeout');
  expect(read()).toHaveLength(1);

  jest.advanceTimersByTime(2999);
  expect(read()).toHaveLength(1);

  jest.advanceTimersByTime(1);
  expect(read()).toHaveLength(0);
});

it('helpers aplican su timeout por defecto (3000) cuando no se provee', () => {
  service.success('s');   
  service.error('e');     
  service.warning('w');   
  service.info('i');      

  expect(read().map(t => t.type)).toEqual(['success', 'error', 'warning', 'info']);

  jest.advanceTimersByTime(3000);
  expect(read()).toHaveLength(0);
});

});
