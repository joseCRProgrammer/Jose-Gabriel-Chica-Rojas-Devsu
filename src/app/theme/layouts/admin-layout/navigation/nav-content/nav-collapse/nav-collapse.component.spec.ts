import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavCollapseComponent } from './nav-collapse.component';

describe('NavCollapseComponent', () => {
  let fixture: ComponentFixture<NavCollapseComponent>;
  let component: NavCollapseComponent;

  const setWindowWidth = (w: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: w });
  };

  const buildMenuDom = () => {
    const container = document.createElement('div');

    const parentUnderTest = document.createElement('div');
    parentUnderTest.className = 'coded-hasmenu';
    parentUnderTest.id = 'parentUnderTest';

    const link = document.createElement('a');
    const span = document.createElement('span');
    span.id = 'spanTarget';
    span.textContent = 'Item';
    link.appendChild(span);
    parentUnderTest.appendChild(link);

    const other = document.createElement('div');
    other.className = 'coded-hasmenu coded-trigger';
    other.id = 'otherMenu';

    container.appendChild(parentUnderTest);
    container.appendChild(other);
    document.body.appendChild(container);

    return { container, parentUnderTest, other, span };
  };

  const cleanupMenuDom = (container: HTMLElement) => {
    document.body.removeChild(container);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavCollapseComponent]
    })
      .overrideComponent(NavCollapseComponent, { set: { template: '' } })
      .compileComponents();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    setWindowWidth(1280);
    fixture = TestBed.createComponent(NavCollapseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('constructor: initializes windowWidth', () => {
    setWindowWidth(1440);
    fixture = TestBed.createComponent(NavCollapseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.windowWidth).toBe(1440);
  });

  it('navCollapse toggles "coded-trigger" on clicked .coded-hasmenu and removes it from others', () => {
    const { container, parentUnderTest, other, span } = buildMenuDom();

    try {
      fixture = TestBed.createComponent(NavCollapseComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const evt = { target: span } as unknown as MouseEvent;
      component.navCollapse(evt);

      expect(parentUnderTest.classList.contains('coded-trigger')).toBe(true);
      expect(other.classList.contains('coded-trigger')).toBe(false);

      component.navCollapse(evt);
      expect(parentUnderTest.classList.contains('coded-trigger')).toBe(false);
    } finally {
      cleanupMenuDom(container);
    }
  });

  it('subMenuCollapse emits via showCollapseItem', () => {
    fixture = TestBed.createComponent(NavCollapseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.fn();
    component.showCollapseItem.subscribe(spy);

    component.subMenuCollapse(undefined as unknown as void);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
