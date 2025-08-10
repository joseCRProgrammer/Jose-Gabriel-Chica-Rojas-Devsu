import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconService } from '@ant-design/icons-angular';
import { NavLeftComponent } from './nav-left.component';
import { MenuUnfoldOutline, MenuFoldOutline, SearchOutline } from '@ant-design/icons-angular/icons';

describe('NavLeftComponent', () => {
  let component: NavLeftComponent;
  let fixture: ComponentFixture<NavLeftComponent>;
  const iconServiceMock = { addIcon: jest.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavLeftComponent],
      providers: [{ provide: IconService, useValue: iconServiceMock }]
    })
      .overrideComponent(NavLeftComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(NavLeftComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('navCollapsed', false);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('constructor: initializes windowWidth and registers icons', () => {
    expect(component.windowWidth).toBe(window.innerWidth);
    expect(iconServiceMock.addIcon).toHaveBeenCalledTimes(1);
    expect(iconServiceMock.addIcon).toHaveBeenCalledWith(
      MenuUnfoldOutline,
      MenuFoldOutline,
      SearchOutline
    );
  });

  it('should emit NavCollapse on navCollapse()', () => {
    const spy = jest.fn();
    component.NavCollapse.subscribe(spy);
    component.navCollapse();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should accept required input navCollapsed', () => {
    fixture.componentRef.setInput('navCollapsed', true);
    fixture.detectChanges();
    expect(component.navCollapsed()).toBe(true);
  });
});
