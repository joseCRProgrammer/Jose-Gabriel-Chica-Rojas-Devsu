import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ElementRef } from '@angular/core';
import { ActionsDropdownComponent } from './actions-dropdown';

describe('ActionsDropdownComponent', () => {
  let fixture: ComponentFixture<ActionsDropdownComponent>;
  let component: ActionsDropdownComponent;

  const mouseEvt = () =>
    ({ stopPropagation: jest.fn() } as unknown as MouseEvent);

  const docClick = (target: EventTarget | null = null) =>
    ({ target } as unknown as MouseEvent);

  const rafOrig = window.requestAnimationFrame;
  let innerHOrig: number;
  let innerWOrig: number;

  beforeAll(() => {
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 0 as unknown as number;
    };
    innerHOrig = window.innerHeight;
    innerWOrig = window.innerWidth;
  });

  afterAll(() => {
    window.requestAnimationFrame = rafOrig;
    Object.defineProperty(window, 'innerHeight', { value: innerHOrig, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: innerWOrig, configurable: true });
  });

  beforeEach(() => {
    (ActionsDropdownComponent as any).opened = null;

    TestBed.configureTestingModule({
      imports: [ActionsDropdownComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(ActionsDropdownComponent);
    component = fixture.componentInstance;
    component.actions = [
      { id: 'edit', label: 'Editar', icon: '✎' },
      { id: 'del', label: 'Eliminar', icon: '✕' },
    ];
    fixture.detectChanges();
  });

  it('defaults', () => {
    expect(component.actions.length).toBe(2);
    expect(component.icon).toBe('');
    expect(component.triggerAria).toBe('Abrir menú de acciones');
    expect(component.open).toBe(false);
  });

  it('toggle abre y cierra', () => {
    const e1 = mouseEvt();
    component.toggle(e1);
    expect(e1.stopPropagation).toHaveBeenCalled();
    expect(component.open).toBe(true);

    const e2 = mouseEvt();
    component.toggle(e2);
    expect(e2.stopPropagation).toHaveBeenCalled();
    expect(component.open).toBe(false);
  });

  it('choose: open=false no emite; open=true emite y cierra', () => {
    const emitSpy = jest.spyOn(component.selected, 'emit');
    const e = mouseEvt();
    component.open = false;
    component.choose('edit', e);
    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.open).toBe(false);

    const e2 = mouseEvt();
    component.open = true;
    component.choose('del', e2);
    expect(emitSpy).toHaveBeenCalledWith('del');
    expect(component.open).toBe(false);
  });

  it('onDocClick fuera cierra; dentro no cierra; respeta ignoreDocClick', () => {
    component.open = true;
    const outside = document.createElement('div');
    component.onDocClick(docClick(outside));
    expect(component.open).toBe(false);

    component.open = true;
    const inside = fixture.debugElement.nativeElement;
    component.onDocClick(docClick(inside));
    expect(component.open).toBe(true);

    (component as any).ignoreDocClick = true;
    const outside2 = document.createElement('div');
    component.onDocClick(docClick(outside2));
    expect(component.open).toBe(true);
  });

  it('onEsc cierra solo si está abierto', () => {
    const ev1 = { stopPropagation: jest.fn() } as unknown as KeyboardEvent;
    component.open = true;
    component.onEsc(ev1);
    expect(ev1.stopPropagation).toHaveBeenCalled();
    expect(component.open).toBe(false);

    const ev2 = { stopPropagation: jest.fn() } as unknown as KeyboardEvent;
    component.open = false;
    component.onEsc(ev2);
    expect(ev2.stopPropagation).not.toHaveBeenCalled();
  });

  it('solo un dropdown abierto a la vez', () => {
    const f1 = TestBed.createComponent(ActionsDropdownComponent);
    const c1 = f1.componentInstance;
    c1.actions = component.actions;
    f1.detectChanges();

    const f2 = TestBed.createComponent(ActionsDropdownComponent);
    const c2 = f2.componentInstance;
    c2.actions = component.actions;
    f2.detectChanges();

    c1.toggle(mouseEvt());
    expect(c1.open).toBe(true);

    c2.toggle(mouseEvt());
    expect(c2.open).toBe(true);
    expect(c1.open).toBe(false);

    c2.toggle(mouseEvt());
    expect(c2.open).toBe(false);
  });

  it('ngOnDestroy limpia registro estático', () => {
    (ActionsDropdownComponent as any).opened = component;
    component.ngOnDestroy();
    expect((ActionsDropdownComponent as any).opened).toBeNull();
  });

  it('positionMenu: debajo y alineado al borde derecho (termina donde dots)', () => {
    const btnEl = document.createElement('button') as any;
    btnEl.getBoundingClientRect = () =>
      ({ top: 100, bottom: 132, left: 900, right: 932, width: 32, height: 32, x: 900, y: 100, toJSON: () => {} } as DOMRect);

    const menuEl = document.createElement('div') as any;
    menuEl.getBoundingClientRect = () =>
      ({ top: 0, bottom: 0, left: 0, right: 0, width: 180, height: 80, x: 0, y: 0, toJSON: () => {} } as DOMRect);

    (component as any).triggerRef = new ElementRef(btnEl);
    (component as any).menuRef = new ElementRef(menuEl);

    (component as any).positionMenu();

    const left = parseInt(menuEl.style.left, 10);
    const top = parseInt(menuEl.style.top, 10);
    expect(left).toBe(932 - 180);
    expect(top).toBe(100 + 32 + 6);
  });

  it('positionMenu: coloca arriba si no hay espacio abajo y clamp a viewport', () => {
    Object.defineProperty(window, 'innerHeight', { value: 300, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });

    const btnEl = document.createElement('button') as any;
    btnEl.getBoundingClientRect = () =>
      ({ top: 280, bottom: 312, left: 100, right: 132, width: 32, height: 32, x: 100, y: 280, toJSON: () => {} } as DOMRect);

    const menuEl = document.createElement('div') as any;
    menuEl.getBoundingClientRect = () =>
      ({ top: 0, bottom: 0, left: 0, right: 0, width: 220, height: 120, x: 0, y: 0, toJSON: () => {} } as DOMRect);

    (component as any).triggerRef = new ElementRef(btnEl);
    (component as any).menuRef = new ElementRef(menuEl);

    (component as any).positionMenu();

    const top = parseInt(menuEl.style.top, 10);
    expect(top).toBe(280 - 6 - 120);
  });

  it('onViewportChange llama a positionMenu cuando está abierto', () => {
    const spy = jest.spyOn(component as any, 'positionMenu');
    component.open = true;
    component.onViewportChange();
    expect(spy).toHaveBeenCalled();
  });

  it('positionMenu: sin refs no lanza', () => {
    (component as any).triggerRef = undefined;
    (component as any).menuRef = undefined;
    expect(() => (component as any).positionMenu()).not.toThrow();
  });
});
