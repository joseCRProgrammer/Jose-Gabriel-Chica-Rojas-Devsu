import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavContentComponent } from './nav-content.component';
import { IconService } from '@ant-design/icons-angular';
import {
  DashboardOutline,
  CreditCardOutline,
  LoginOutline,
  QuestionOutline,
  ChromeOutline,
  FontSizeOutline,
  ProfileOutline,
  BgColorsOutline,
  AntDesignOutline
} from '@ant-design/icons-angular/icons';
import { Location, LocationStrategy } from '@angular/common';

describe('NavContentComponent', () => {
  let fixture: ComponentFixture<NavContentComponent>;
  let component: NavContentComponent;

  const iconServiceMock = { addIcon: jest.fn() };
  const locationMock = { path: jest.fn() };
  const locationStrategyMock = { getBaseHref: jest.fn() };

  const expectedIcons = [
    DashboardOutline,
    CreditCardOutline,
    FontSizeOutline,
    LoginOutline,
    ProfileOutline,
    BgColorsOutline,
    AntDesignOutline,
    ChromeOutline,
    QuestionOutline
  ];

  const setWindowWidth = (w: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: w });
  };

  const appendToBody = (el: HTMLElement) => {
    document.body.appendChild(el);
    return () => document.body.contains(el) && document.body.removeChild(el);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavContentComponent],
      providers: [
        { provide: IconService, useValue: iconServiceMock },
        { provide: Location, useValue: locationMock },
        { provide: LocationStrategy, useValue: locationStrategyMock }
      ]
    })
      .overrideComponent(NavContentComponent, { set: { template: '' } })
      .compileComponents();

    jest.clearAllMocks();
  });

  it('should create', () => {
    setWindowWidth(1280);
    fixture = TestBed.createComponent(NavContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('constructor: registers icons and sets initial state', () => {
    setWindowWidth(1366);
    fixture = TestBed.createComponent(NavContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(iconServiceMock.addIcon).toHaveBeenCalledTimes(1);
    expect(iconServiceMock.addIcon).toHaveBeenCalledWith(...expectedIcons);
    expect(component.windowWidth).toBe(1366);
    expect(component.navigation).toBeDefined();
    expect(Array.isArray(component.navigations)).toBe(true);
  });

  it('ngOnInit: adds "menupos-static" when window width < 1025', () => {
    setWindowWidth(800);
    const navbar = document.createElement('div');
    navbar.className = 'coded-navbar';
    const cleanup = appendToBody(navbar);

    try {
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      expect(navbar.classList.contains('menupos-static')).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('fireOutClick: activates parent .coded-hasmenu of current link', () => {
    locationStrategyMock.getBaseHref.mockReturnValue('');
    locationMock.path.mockReturnValue('/current');

    const parent = document.createElement('li');
    parent.className = 'coded-hasmenu';

    const link = document.createElement('a');
    link.className = 'nav-link';
    link.setAttribute('href', '/current');
    parent.appendChild(link);

    const cleanup = appendToBody(parent);

    try {
      setWindowWidth(1200);
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.fireOutClick();

      expect(parent.classList.contains('coded-trigger')).toBe(true);
      expect(parent.classList.contains('active')).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('fireOutClick: activates up_parent when it has .coded-hasmenu', () => {
    locationStrategyMock.getBaseHref.mockReturnValue('');
    locationMock.path.mockReturnValue('/u');

    const up = document.createElement('li');
    up.className = 'coded-hasmenu';

    const ul = document.createElement('ul');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.setAttribute('href', '/u');

    li.appendChild(a);
    ul.appendChild(li);
    up.appendChild(ul);

    const cleanup = appendToBody(up);
    try {
      setWindowWidth(1200);
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.fireOutClick();

      expect(up.classList.contains('coded-trigger')).toBe(true);
      expect(up.classList.contains('active')).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('fireOutClick: activates last_parent when it has .coded-hasmenu', () => {
    locationStrategyMock.getBaseHref.mockReturnValue('');
    locationMock.path.mockReturnValue('/v');

    const last = document.createElement('li');
    last.className = 'coded-hasmenu';

    const ul2 = document.createElement('ul');
    const mid = document.createElement('li');
    const ul1 = document.createElement('ul');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.setAttribute('href', '/v');

    li.appendChild(a);
    ul1.appendChild(li);
    mid.appendChild(ul1);
    ul2.appendChild(mid);
    last.appendChild(ul2);

    const cleanup = appendToBody(last);
    try {
      setWindowWidth(1200);
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.fireOutClick();

      expect(last.classList.contains('coded-trigger')).toBe(false);
      expect(last.classList.contains('active')).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('fireOutClick: does nothing when no matching link exists', () => {
    locationStrategyMock.getBaseHref.mockReturnValue('');
    locationMock.path.mockReturnValue('/nope');

    const up = document.createElement('li');
    up.className = 'coded-hasmenu';
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.setAttribute('href', '/other');
    up.appendChild(a);

    const cleanup = appendToBody(up);
    try {
      setWindowWidth(1200);
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.fireOutClick();

      expect(up.classList.contains('coded-trigger')).toBe(false);
      expect(up.classList.contains('active')).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('fireOutClick: resolves with baseHref when provided', () => {
    locationStrategyMock.getBaseHref.mockReturnValue('/base/');
    locationMock.path.mockReturnValue('section/page');

    const parent = document.createElement('li');
    parent.className = 'coded-hasmenu';
    const link = document.createElement('a');
    link.className = 'nav-link';
    link.setAttribute('href', '/base/section/page');
    parent.appendChild(link);
    const cleanup = appendToBody(parent);

    try {
      setWindowWidth(1200);
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.fireOutClick();

      expect(parent.classList.contains('coded-trigger')).toBe(true);
      expect(parent.classList.contains('active')).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('navMob: emits when width < 1025 and nav is mob-open', () => {
    setWindowWidth(800);
    const nav = document.createElement('app-navigation');
    nav.className = 'coded-navbar mob-open';
    const cleanup = appendToBody(nav);

    try {
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = jest.fn();
      component.NavCollapsedMob.subscribe(spy);

      component.navMob();

      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      cleanup();
    }
  });

  it('navMob: does not emit when width >= 1025', () => {
    setWindowWidth(1200);
    const nav = document.createElement('app-navigation');
    nav.className = 'coded-navbar mob-open';
    const cleanup = appendToBody(nav);

    try {
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = jest.fn();
      component.NavCollapsedMob.subscribe(spy);

      component.navMob();

      expect(spy).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });

  it('navMob: does not emit when nav is not mob-open', () => {
    setWindowWidth(800);
    const nav = document.createElement('app-navigation');
    nav.className = 'coded-navbar';
    const cleanup = appendToBody(nav);

    try {
      fixture = TestBed.createComponent(NavContentComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const spy = jest.fn();
      component.NavCollapsedMob.subscribe(spy);

      component.navMob();

      expect(spy).not.toHaveBeenCalled();
    } finally {
      cleanup();
    }
  });
});
