import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavItemComponent } from './nav-item.component';

describe('NavItemComponent', () => {
  let fixture: ComponentFixture<NavItemComponent>;
  let component: NavItemComponent;

  const appendToBody = (el: HTMLElement) => {
    document.body.appendChild(el);
    return () => document.body.contains(el) && document.body.removeChild(el);
  };

  const ensureSidebar = (classes?: string) => {
    const sidebar = document.createElement('app-navigation');
    sidebar.className = `pc-sidebar${classes ? ' ' + classes : ''}`;
    const cleanup = appendToBody(sidebar);
    return { sidebar, cleanup };
  };

  const addOtherCodedMenu = () => {
    const other = document.createElement('li');
    other.className = 'coded-hasmenu coded-trigger active';
    const cleanup = appendToBody(other);
    return { other, cleanup };
  };

  const buildDomChain = (opts: { setParentHasMenu?: boolean; setUpHasMenu?: boolean; setLastHasMenu?: boolean }) => {
    const last_parent = document.createElement('li');
    if (opts.setLastHasMenu) last_parent.classList.add('coded-hasmenu');

    const up_parent = document.createElement(opts.setUpHasMenu ? 'li' : 'div');
    if (opts.setUpHasMenu) up_parent.classList.add('coded-hasmenu');

    const p2 = document.createElement('div');
    const p1 = document.createElement('div');

    const parent = document.createElement(opts.setParentHasMenu ? 'li' : 'div');
    if (opts.setParentHasMenu) parent.classList.add('coded-hasmenu');

    const link = document.createElement('a');
    const span = document.createElement('span');
    span.textContent = 'click';

    link.appendChild(span);
    parent.appendChild(link);
    p1.appendChild(parent);
    p2.appendChild(p1);
    up_parent.appendChild(p2);
    last_parent.appendChild(up_parent);

    const cleanup = appendToBody(last_parent);
    return { span, parent, up_parent, last_parent, cleanup };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavItemComponent]
    })
      .overrideComponent(NavItemComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(NavItemComponent);
    fixture.componentRef.setInput('item', {} as any);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closeOtherMenu: when parent has "coded-hasmenu", activates parent and clears others', () => {
    const { sidebar, cleanup: cleanupSidebar } = ensureSidebar();
    const { other, cleanup: cleanupOther } = addOtherCodedMenu();
    const { span, parent, last_parent, cleanup } = buildDomChain({
      setParentHasMenu: true,
      setUpHasMenu: false,
      setLastHasMenu: false
    });

    try {
      expect(other.classList.contains('active')).toBe(true);
      expect(other.classList.contains('coded-trigger')).toBe(true);

      component.closeOtherMenu({ target: span } as unknown as MouseEvent);

      expect(parent.classList.contains('coded-trigger')).toBe(false);
      expect(parent.classList.contains('active')).toBe(false);

      expect(other.classList.contains('active')).toBe(false);
      expect(other.classList.contains('coded-trigger')).toBe(false);

      expect(sidebar.classList.contains('mob-open')).toBe(false);
      expect(last_parent.classList.contains('active')).toBe(false);
    } finally {
      cleanup();
      cleanupOther();
      cleanupSidebar();
    }
  });

  it('closeOtherMenu: when up_parent has "coded-hasmenu", activates up_parent', () => {
    ensureSidebar();
    addOtherCodedMenu();
    const { span, up_parent, cleanup } = buildDomChain({
      setParentHasMenu: false,
      setUpHasMenu: true,
      setLastHasMenu: false
    });

    try {
      component.closeOtherMenu({ target: span } as unknown as MouseEvent);

      expect(up_parent.classList.contains('coded-trigger')).toBe(true);
      expect(up_parent.classList.contains('active')).toBe(true);
    } finally {
      cleanup();
    }
  });

  it('closeOtherMenu: when last_parent has "coded-hasmenu", activates last_parent', () => {
    ensureSidebar();
    addOtherCodedMenu();
    const { span, last_parent, cleanup } = buildDomChain({
      setParentHasMenu: false,
      setUpHasMenu: false,
      setLastHasMenu: true
    });

    try {
      component.closeOtherMenu({ target: span } as unknown as MouseEvent);

      expect(last_parent.classList.contains('coded-trigger')).toBe(false);
      expect(last_parent.classList.contains('active')).toBe(false);
    } finally {
      cleanup();
    }
  });

  it('closeOtherMenu: removes "mob-open" from sidebar if present', () => {
    const { sidebar, cleanup } = ensureSidebar('mob-open');
    const { span, cleanup: cleanupChain } = buildDomChain({
      setParentHasMenu: true,
      setUpHasMenu: false,
      setLastHasMenu: false
    });

    try {
      expect(sidebar.classList.contains('mob-open')).toBe(true);

      component.closeOtherMenu({ target: span } as unknown as MouseEvent);

      expect(sidebar.classList.contains('mob-open')).toBe(false);
    } finally {
      cleanup();
      cleanupChain();
    }
  });
});
