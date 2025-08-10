import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { IconService } from '@ant-design/icons-angular';
import { Subject } from 'rxjs';
import { NavigationItem } from 'src/app/theme/layouts/admin-layout/navigation/navigation';

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;
  let component: BreadcrumbComponent;

  let routerEvents$: Subject<Event>;
  let routerMock: Partial<Router>;
  const titleMock = { setTitle: jest.fn() } as unknown as Title;
  const iconServiceMock = { addIcon: jest.fn() } as unknown as IconService;

  const navMock: NavigationItem[] = [
    {
      id: 'grp',
      title: 'General',
      type: 'group',
      breadcrumbs: true,
      children: [
        { id: 'dash', title: 'Dashboard', type: 'item', url: '/dashboard', breadcrumbs: true },
        {
          id: 'admin',
          title: 'Administración',
          type: 'collapse',
          breadcrumbs: true,
          children: [
            { id: 'usuarios', title: 'Usuarios', type: 'item', url: '/admin/users', breadcrumbs: true }
          ]
        }
      ]
    },
    { id: 'directo', title: 'Acerca de', type: 'item', url: '/about', breadcrumbs: true }
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    routerEvents$ = new Subject<Event>();
    routerMock = { events: routerEvents$.asObservable() as any };

    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: Title, useValue: titleMock },
        { provide: IconService, useValue: iconServiceMock }
      ]
    })
      .overrideComponent(BreadcrumbComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
    component.navigations = navMock; // usamos el mock de navegación del test
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('constructor: registra íconos y setea valores por defecto', () => {
    expect(iconServiceMock.addIcon).toHaveBeenCalledTimes(1);
    expect(component.type).toBe('theme1');
    expect(component.navigations).toBe(navMock);
  });

  it('setBreadcrumb: actualiza navigationList y título al navegar a /dashboard', () => {
    routerEvents$.next(new NavigationEnd(1, '/dashboard', '/dashboard'));
    expect(component.navigationList?.map((x) => x.title)).toEqual(['General', 'Dashboard']);
    expect(titleMock.setTitle).toHaveBeenCalledWith('Dashboard | devsu');
  });

  it('setBreadcrumb: actualiza navigationList y título al navegar a item anidado', () => {
    routerEvents$.next(new NavigationEnd(2, '/admin/users', '/admin/users'));
    expect(component.navigationList?.map((x) => x.title)).toEqual(['General', 'Administración', 'Usuarios']);
    expect(titleMock.setTitle).toHaveBeenCalledWith('Usuarios | devsu');
  });

  it('setBreadcrumb: navega a item directo en raíz', () => {
    routerEvents$.next(new NavigationEnd(3, '/about', '/about'));
    expect(component.navigationList?.map((x) => x.title)).toEqual(['Acerca de']);
    expect(titleMock.setTitle).toHaveBeenCalledWith('Acerca de | devsu');
  });

  it('soporta múltiples emisiones de NavigationEnd (la última gana)', () => {
    routerEvents$.next(new NavigationEnd(4, '/dashboard', '/dashboard'));
    routerEvents$.next(new NavigationEnd(5, '/about', '/about'));
    expect(component.navigationList?.map((x) => x.title)).toEqual(['Acerca de']);
    expect(titleMock.setTitle).toHaveBeenCalledWith('Acerca de | devsu');
  });
});
