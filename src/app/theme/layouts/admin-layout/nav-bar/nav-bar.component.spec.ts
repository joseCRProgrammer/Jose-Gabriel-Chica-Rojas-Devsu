// nav-bar.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
  let fixture: ComponentFixture<NavBarComponent>;
  let component: NavBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarComponent],
    })
      .overrideComponent(NavBarComponent, { set: { template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('constructor: inicializa windowWidth y navCollapsedMob (vía instancia de TestBed)', () => {
    expect(component.windowWidth).toBe(window.innerWidth);
    expect(component.navCollapsedMob).toBe(false);
  });

  it('navCollapse: con windowWidth >= 1025 alterna navCollapsed y emite NavCollapse', () => {
    component.windowWidth = 1200;
    component.navCollapsed = false;
    const emitSpy = jest.spyOn(component.NavCollapse, 'emit');

    component.navCollapse();
    expect(component.navCollapsed).toBe(true);
    expect(emitSpy).toHaveBeenCalledTimes(1);

    component.navCollapse();
    expect(component.navCollapsed).toBe(false);
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });

  it('navCollapse: con windowWidth < 1025 no emite ni alterna', () => {
    component.windowWidth = 800;
    component.navCollapsed = false;
    const emitSpy = jest.spyOn(component.NavCollapse, 'emit');

    component.navCollapse();
    expect(component.navCollapsed).toBe(false);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('navCollapseMob: con windowWidth < 1025 emite NavCollapsedMob', () => {
    component.windowWidth = 800;
    const emitSpy = jest.spyOn(component.NavCollapsedMob, 'emit');

    component.navCollapseMob();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('navCollapseMob: con windowWidth >= 1025 no emite', () => {
    component.windowWidth = 1300;
    const emitSpy = jest.spyOn(component.NavCollapsedMob, 'emit');

    component.navCollapseMob();
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
