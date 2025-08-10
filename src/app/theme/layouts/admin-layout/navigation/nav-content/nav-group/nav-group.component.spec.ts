import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavGroupComponent } from './nav-group.component';
import { Location } from '@angular/common';

describe('NavGroupComponent', () => {
  let fixture: ComponentFixture<NavGroupComponent>;
  let component: NavGroupComponent;

  const locationMock: any = { path: jest.fn(), _baseHref: undefined };

  const appendToBody = (el: HTMLElement) => {
    document.body.appendChild(el);
    return () => document.body.contains(el) && document.body.removeChild(el);
  };

  const setHref = (href: string) => {
    locationMock.path.mockReturnValue(href.startsWith('/') ? href : `/${href}`);
  };

  const buildWithLastParentChain = (targetHref: string) => {
    const lastParent = document.createElement('li');
    const w1 = document.createElement('div');
    const w2 = document.createElement('div');
    const w3 = document.createElement('div');
    const w4 = document.createElement('div');

    const upParent = document.createElement('div');
    const parent = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.setAttribute('href', targetHref);
    parent.appendChild(a);
    upParent.appendChild(parent);

    w4.appendChild(upParent);
    w3.appendChild(w4);
    w2.appendChild(w3);
    w1.appendChild(w2);
    lastParent.appendChild(w1);

    return { lastParent, upParent, parent, a, cleanup: appendToBody(lastParent) };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavGroupComponent],
      providers: [{ provide: Location, useValue: locationMock }]
    })
      .overrideComponent(NavGroupComponent, { set: { template: '' } })
      .compileComponents();

    jest.clearAllMocks();
    locationMock._baseHref = undefined;
  });

  it('should create', () => {
    fixture = TestBed.createComponent(NavGroupComponent);
    fixture.componentRef.setInput('item', {} as any);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('ngOnInit: activates parent when parent has "coded-hasmenu"', () => {
    setHref('/current');

    const { lastParent, parent, a, cleanup } = buildWithLastParentChain('/current');
    parent.className = 'coded-hasmenu';

    try {
      fixture = TestBed.createComponent(NavGroupComponent);
      fixture.componentRef.setInput('item', {} as any);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(parent.classList.contains('coded-trigger')).toBe(true);
      expect(parent.classList.contains('active')).toBe(true);
      expect(lastParent.classList.contains('active')).toBe(true);
      expect(document.querySelector(`a.nav-link[href="/current"]`)).toBe(a);
    } finally {
      cleanup();
    }
  });

  it('ngOnInit: activates up_parent when up_parent has "coded-hasmenu"', () => {
    setHref('/up');

    const { lastParent, upParent, cleanup } = buildWithLastParentChain('/up');
    const upHasMenu = document.createElement('li');
    upHasMenu.className = 'coded-hasmenu';
    upHasMenu.appendChild(upParent.firstChild as Node);
    upParent.replaceWith(upHasMenu);

    try {
      fixture = TestBed.createComponent(NavGroupComponent);
      fixture.componentRef.setInput('item', {} as any);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(upHasMenu.classList.contains('coded-trigger')).toBe(false);
      expect(upHasMenu.classList.contains('active')).toBe(false);
      expect(lastParent.classList.contains('active')).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('ngOnInit: activates pre_parent when pre_parent has "coded-hasmenu"', () => {
    setHref('/pre');

    const { lastParent, upParent, cleanup } = buildWithLastParentChain('/pre');
    const preParent = document.createElement('li');
    preParent.className = 'coded-hasmenu';
    upParent.parentElement!.replaceWith(preParent);
    preParent.appendChild(upParent);

    try {
      fixture = TestBed.createComponent(NavGroupComponent);
      fixture.componentRef.setInput('item', {} as any);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(preParent.classList.contains('coded-trigger')).toBe(true);
      expect(preParent.classList.contains('active')).toBe(true);
      expect(lastParent.classList.contains('active')).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('ngOnInit: when _baseHref is set, resolves link and activates last_parent and pre_parent', () => {
    locationMock._baseHref = '/base/';
    locationMock.path.mockReturnValue('section/page');

    const { lastParent, upParent, cleanup } = buildWithLastParentChain('/base/section/page');
    lastParent.classList.add('coded-hasmenu');

    const preParent = document.createElement('li');
    preParent.className = 'coded-hasmenu';
    upParent.parentElement!.replaceWith(preParent);
    preParent.appendChild(upParent);

    try {
      fixture = TestBed.createComponent(NavGroupComponent);
      fixture.componentRef.setInput('item', {} as any);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(lastParent.classList.contains('coded-trigger')).toBe(true);
      expect(lastParent.classList.contains('active')).toBe(true);
      expect(preParent.classList.contains('coded-trigger')).toBe(true);
    } finally {
      cleanup();
    }
  });
});
