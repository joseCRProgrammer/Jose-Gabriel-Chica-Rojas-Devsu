import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ModalComponent } from './modal';

describe('ModalComponent', () => {
  let component: ModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(ModalComponent, {
      set: { template: '<div></div>' },
    });

    const fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('valores por defecto', () => {
    expect(component.open).toBe(false);
    expect(component.message).toBe('¿Estás seguro de eliminar el producto');
    expect(component.cancelLabel).toBe('Cancelar');
    expect(component.confirmLabel).toBe('Confirmar');
    expect(component.confirmDisabled).toBe(false);
    expect(component.closeOnBackdrop).toBe(true);
  });

  it('onEsc: si open=false no hace nada', () => {
    const ev = { stopPropagation: jest.fn() } as unknown as KeyboardEvent;
    component.open = false;

    component.onEsc(ev);

    expect(ev.stopPropagation).not.toHaveBeenCalled();
  });

  it('onEsc: si open=true hace stopPropagation y dispara triggerCancel', () => {
    const ev = { stopPropagation: jest.fn() } as unknown as KeyboardEvent;
    const cancelSpy = jest.spyOn(component, 'triggerCancel');

    component.open = true;
    component.onEsc(ev);

    expect(ev.stopPropagation).toHaveBeenCalled();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('onBackdropClick: con open=false no hace nada', () => {
    const cancelSpy = jest.spyOn(component, 'triggerCancel');
    component.open = false;

    component.onBackdropClick();

    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('onBackdropClick: con closeOnBackdrop=false no hace nada', () => {
    const cancelSpy = jest.spyOn(component, 'triggerCancel');
    component.open = true;
    component.closeOnBackdrop = false;

    component.onBackdropClick();

    expect(cancelSpy).not.toHaveBeenCalled();
  });

  it('onBackdropClick: con open=true y closeOnBackdrop=true dispara triggerCancel', () => {
    const cancelSpy = jest.spyOn(component, 'triggerCancel');
    component.open = true;
    component.closeOnBackdrop = true;

    component.onBackdropClick();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('stop: llama stopPropagation del evento', () => {
    const e = { stopPropagation: jest.fn() } as unknown as MouseEvent;
    component.stop(e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });

  it('triggerCancel: cierra modal y emite cancel + closed', () => {
    const cancelEmit = jest.spyOn(component.cancel, 'emit');
    const closedEmit = jest.spyOn(component.closed, 'emit');

    component.open = true;
    component.triggerCancel();

    expect(component.open).toBe(false);
    expect(cancelEmit).toHaveBeenCalledTimes(1);
    expect(closedEmit).toHaveBeenCalledTimes(1);
  });

  it('triggerConfirm: si confirmDisabled=true no hace nada', () => {
    const confirmEmit = jest.spyOn(component.confirm, 'emit');
    const closedEmit = jest.spyOn(component.closed, 'emit');

    component.confirmDisabled = true;
    component.open = true;

    component.triggerConfirm();

    expect(component.open).toBe(true);
    expect(confirmEmit).not.toHaveBeenCalled();
    expect(closedEmit).not.toHaveBeenCalled();
  });

  it('triggerConfirm: si confirmDisabled=false cierra y emite confirm + closed', () => {
    const confirmEmit = jest.spyOn(component.confirm, 'emit');
    const closedEmit = jest.spyOn(component.closed, 'emit');

    component.confirmDisabled = false;
    component.open = true;

    component.triggerConfirm();

    expect(component.open).toBe(false);
    expect(confirmEmit).toHaveBeenCalledTimes(1);
    expect(closedEmit).toHaveBeenCalledTimes(1);
  });
});
