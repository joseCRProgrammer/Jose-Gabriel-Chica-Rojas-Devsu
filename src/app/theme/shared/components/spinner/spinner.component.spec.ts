import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { Spinkit } from './spinkits';

describe('SpinnerComponent', () => {
  let fixture: ComponentFixture<SpinnerComponent>;
  let component: SpinnerComponent;

  let routerEvents$: Subject<Event>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    routerEvents$ = new Subject<Event>();
    routerMock = { events: routerEvents$.asObservable() as any };

    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: DOCUMENT, useValue: document }
      ]
    })
      .overrideComponent(SpinnerComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener valores por defecto en inputs y estado inicial', () => {
    expect(component.backgroundColor()).toBe('#1890ff');
    expect(component.spinner()).toBe(Spinkit.skLine);
    expect(component.isSpinnerVisible).toBe(true);
  });

  it('debe mostrar el spinner en NavigationStart', () => {
    component.isSpinnerVisible = false;
    routerEvents$.next(new NavigationStart(1, '/ruta'));
    expect(component.isSpinnerVisible).toBe(true);
  });

  it('debe ocultar el spinner en NavigationEnd', () => {
    component.isSpinnerVisible = true;
    routerEvents$.next(new NavigationEnd(1, '/ruta', '/ruta'));
    expect(component.isSpinnerVisible).toBe(false);
  });

  it('debe ocultar el spinner en NavigationCancel', () => {
    component.isSpinnerVisible = true;
    routerEvents$.next(new NavigationCancel(1, '/ruta', 'cancelado'));
    expect(component.isSpinnerVisible).toBe(false);
  });

  it('debe ocultar el spinner en NavigationError', () => {
    component.isSpinnerVisible = true;
    routerEvents$.next(new NavigationError(1, '/ruta', new Error('x')));
    expect(component.isSpinnerVisible).toBe(false);
  });

  it('debe ocultar el spinner si la suscripción emite error', () => {
    component.isSpinnerVisible = true;
    routerEvents$.error(new Error('stream error'));
    expect(component.isSpinnerVisible).toBe(false);
  });

  it('ngOnDestroy: debe ocultar el spinner', () => {
    component.isSpinnerVisible = true;
    component.ngOnDestroy();
    expect(component.isSpinnerVisible).toBe(false);
  });
});
