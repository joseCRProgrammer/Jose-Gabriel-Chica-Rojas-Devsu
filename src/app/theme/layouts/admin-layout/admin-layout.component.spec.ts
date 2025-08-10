import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminComponent } from './admin-layout.component';

describe('AdminComponent', () => {
  let fixture: ComponentFixture<AdminComponent>;
  let component: AdminComponent;

  function createSidebar(classes: string[] = []): HTMLElement {
    const el = document.createElement('app-navigation');
    el.classList.add('pc-sidebar', ...classes);
    document.body.appendChild(el);
    return el;
  }

  function cleanupSidebar(el?: HTMLElement) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
    })
      .overrideComponent(AdminComponent, { set: { template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.querySelectorAll('app-navigation.pc-sidebar').forEach(n => n.remove());
  });

  it('debe crearse', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('navMobClick: cuando navCollapsedMob=true y sidebar no tiene "mob-open", hace toggle inmediato y luego otro a los 100ms', () => {
    const sidebar = createSidebar();
    component.navCollapsedMob = true;

    component.navMobClick();
    expect(component.navCollapsedMob).toBe(false);

    jest.advanceTimersByTime(99);
    expect(component.navCollapsedMob).toBe(false);

    jest.advanceTimersByTime(1);
    expect(component.navCollapsedMob).toBe(true);

    cleanupSidebar(sidebar);
  });

  it('navMobClick: rama else, hace un único toggle si sidebar tiene "mob-open"', () => {
    const sidebar = createSidebar(['mob-open']);
    component.navCollapsedMob = false;

    component.navMobClick();
    expect(component.navCollapsedMob).toBe(true);

    jest.runOnlyPendingTimers();
    expect(component.navCollapsedMob).toBe(true);

    cleanupSidebar(sidebar);
  });

  it('navMobClick: remueve clase "navbar-collapsed" del sidebar si existe', () => {
    const sidebar = createSidebar(['navbar-collapsed']);
    component.navCollapsedMob = false;

    component.navMobClick();

    expect(sidebar.classList.contains('navbar-collapsed')).toBe(false);
    cleanupSidebar(sidebar);
  });

  it('handleKeyDown con Escape cierra el menú (remueve "mob-open")', () => {
    const sidebar = createSidebar(['mob-open']);
    expect(sidebar.classList.contains('mob-open')).toBe(true);

    const evt = new KeyboardEvent('keydown', { key: 'Escape' });
    component.handleKeyDown(evt);

    expect(sidebar.classList.contains('mob-open')).toBe(false);
    cleanupSidebar(sidebar);
  });

  it('closeMenu: elimina "mob-open" si está presente', () => {
    const sidebar = createSidebar(['mob-open']);
    component.closeMenu();
    expect(sidebar.classList.contains('mob-open')).toBe(false);
    cleanupSidebar(sidebar);
  });

  it('closeMenu: no falla si no hay sidebar en el DOM', () => {
    expect(() => component.closeMenu()).not.toThrow();
  });
});
