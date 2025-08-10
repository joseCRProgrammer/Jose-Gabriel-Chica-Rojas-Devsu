import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationComponent } from './navigation.component';

describe('NavigationComponent', () => {
  let fixture: ComponentFixture<NavigationComponent>;
  let component: NavigationComponent;

  const setWindowWidth = (w: number) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: w });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent]
    })
      .overrideComponent(NavigationComponent, { set: { template: '' } })
      .compileComponents();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    setWindowWidth(1200);
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('constructor: initializes windowWidth and navCollapsedMob=false', () => {
    setWindowWidth(1366);
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.windowWidth).toBe(1366);
    expect(component.navCollapsedMob).toBe(false);
  });

  it('navCollapseMob emits when width < 1025', () => {
    setWindowWidth(800);
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const spy = jest.fn();
    component.NavCollapsedMob.subscribe(spy);
    component.navCollapseMob();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('navCollapseMob does not emit when width >= 1025', () => {
    setWindowWidth(1400);
    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const spy = jest.fn();
    component.NavCollapsedMob.subscribe(spy);
    component.navCollapseMob();
    expect(spy).not.toHaveBeenCalled();
  });
});
