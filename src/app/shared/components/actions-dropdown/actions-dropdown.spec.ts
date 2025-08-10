import { TestBed } from '@angular/core/testing';
import { ActionsDropdownComponent } from './actions-dropdown';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ActionsDropdownComponent', () => {
  let component: ActionsDropdownComponent;

  const mouseEvt = () =>
    ({ stopPropagation: jest.fn() } as unknown as MouseEvent);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActionsDropdownComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

  
    TestBed.overrideComponent(ActionsDropdownComponent, {
      set: { template: '<div></div>' },
    });

    const fixture = TestBed.createComponent(ActionsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('valores por defecto: actions=[], icon="", triggerAria="Abrir menú de acciones", open=false', () => {
    expect(component.actions).toEqual([]);
    expect(component.icon).toBe('');
    expect(component.triggerAria).toBe('Abrir menú de acciones');
    expect(component.open).toBe(false);
  });

  it('toggle: alterna open y llama stopPropagation del evento', () => {
    const e1 = mouseEvt();
    component.toggle(e1);
    expect(e1.stopPropagation).toHaveBeenCalled();
    expect(component.open).toBe(true);

    const e2 = mouseEvt();
    component.toggle(e2);
    expect(e2.stopPropagation).toHaveBeenCalled();
    expect(component.open).toBe(false);
  });

  it('choose: si open=false no emite y mantiene open=false', () => {
    const emitSpy = jest.spyOn(component.selected, 'emit');
    const e = mouseEvt();

    component.open = false;
    component.choose('edit', e);

    expect(e.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.open).toBe(false);
  });

  it('choose: si open=true emite id y cierra (open=false)', () => {
    const emitSpy = jest.spyOn(component.selected, 'emit');
    const e = mouseEvt();

    component.open = true;
    component.choose('delete', e);

    expect(e.stopPropagation).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith('delete');
    expect(component.open).toBe(false);
  });

  it('onDocClick: cierra cuando está abierto y no cambia cuando ya está cerrado', () => {
    component.open = true;
    component.onDocClick();
    expect(component.open).toBe(false);

    component.onDocClick();
    expect(component.open).toBe(false);
  });

  it('onEsc: si open=true, hace stopPropagation y cierra; si open=false, no hace nada', () => {
    const escEvent = { stopPropagation: jest.fn() } as unknown as KeyboardEvent;

    component.open = true;
    component.onEsc(escEvent);
    expect(escEvent.stopPropagation).toHaveBeenCalled();
    expect(component.open).toBe(false);

    const escEvent2 = { stopPropagation: jest.fn() } as unknown as KeyboardEvent;
    component.open = false;
    component.onEsc(escEvent2);
    expect(escEvent2.stopPropagation).not.toHaveBeenCalled();
    expect(component.open).toBe(false);
  });
});
