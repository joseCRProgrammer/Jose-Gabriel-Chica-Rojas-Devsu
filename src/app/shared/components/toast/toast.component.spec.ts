import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

type ToastMsg = { id: string; type: string; message: string };

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let component: ToastComponent;

  let mockToastService: {
    messages: jest.Mock<ToastMsg[], []>;
    remove: jest.Mock<void, [string]>;
  };

  beforeEach(async () => {
    mockToastService = {
      messages: jest.fn<ToastMsg[], []>().mockReturnValue([]),
      remove: jest.fn<void, [string]>(),
    };

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [{ provide: ToastService, useValue: mockToastService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
  });

  function setMessages(msgs: ToastMsg[]) {
    mockToastService.messages.mockReturnValue(msgs);
    fixture.detectChanges();
  }

  it('debe crearse', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('no renderiza toasts cuando no hay mensajes', () => {
    setMessages([]);
    const toasts = fixture.debugElement.queryAll(By.css('.toast'));
    expect(toasts.length).toBe(0);
  });

  it('renderiza toasts con el texto y clase de tipo', () => {
    const msgs: ToastMsg[] = [
      { id: '1', type: 'success', message: 'Guardado con éxito' },
      { id: '2', type: 'error', message: 'Algo falló' },
    ];
    setMessages(msgs);

    const toastEls = fixture.debugElement.queryAll(By.css('.toast'));
    expect(toastEls.length).toBe(2);

    const first = toastEls[0].nativeElement as HTMLElement;
    const second = toastEls[1].nativeElement as HTMLElement;

    expect(first.textContent).toContain('Guardado con éxito');
    expect(second.textContent).toContain('Algo falló');
    
    expect(first.className).toContain('toast');
    expect(first.className).toContain('success');
    expect(second.className).toContain('toast');
    expect(second.className).toContain('error');
  });

  it('al hacer click en cerrar, llama a toastService.remove con el id correcto', () => {
    const msgs: ToastMsg[] = [
      { id: 'a', type: 'info', message: 'Hola' },
      { id: 'b', type: 'warning', message: 'Cuidado' },
    ];
    setMessages(msgs);

    const closeBtns = fixture.debugElement.queryAll(By.css('.close-btn'));
    expect(closeBtns.length).toBe(2);

    closeBtns[1].nativeElement.click();
    expect(mockToastService.remove).toHaveBeenCalledTimes(1);
    expect(mockToastService.remove).toHaveBeenCalledWith('b');
  });

  it('actualiza la vista cuando cambia el array de mensajes', () => {
    setMessages([{ id: 'x', type: 'info', message: 'Primero' }]);
    expect(fixture.debugElement.queryAll(By.css('.toast')).length).toBe(1);

    setMessages([
      { id: 'x', type: 'info', message: 'Primero' },
      { id: 'y', type: 'success', message: 'Segundo' },
    ]);
    expect(fixture.debugElement.queryAll(By.css('.toast')).length).toBe(2);

    setMessages([]);
    expect(fixture.debugElement.queryAll(By.css('.toast')).length).toBe(0);
  });
});
