import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconService } from '@ant-design/icons-angular';
import { NavRightComponent } from './nav-right.component';
import {
  BellOutline,
  SettingOutline,
  GiftOutline,
  MessageOutline,
  PhoneOutline,
  CheckCircleOutline,
  LogoutOutline,
  EditOutline,
  UserOutline,
  ProfileOutline,
  WalletOutline,
  QuestionCircleOutline,
  LockOutline,
  CommentOutline,
  UnorderedListOutline,
  ArrowRightOutline,
  GithubOutline
} from '@ant-design/icons-angular/icons';

describe('NavRightComponent', () => {
  let component: NavRightComponent;
  let fixture: ComponentFixture<NavRightComponent>;
  const iconServiceMock = { addIcon: jest.fn() };

  const expectedIcons = [
    CheckCircleOutline,
    GiftOutline,
    MessageOutline,
    SettingOutline,
    PhoneOutline,
    LogoutOutline,
    UserOutline,
    EditOutline,
    ProfileOutline,
    QuestionCircleOutline,
    LockOutline,
    CommentOutline,
    UnorderedListOutline,
    ArrowRightOutline,
    BellOutline,
    GithubOutline,
    WalletOutline
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavRightComponent],
      providers: [{ provide: IconService, useValue: iconServiceMock }]
    })
      .overrideComponent(NavRightComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(NavRightComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('styleSelectorToggle', false);
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
    expect(iconServiceMock.addIcon).toHaveBeenCalledWith(...expectedIcons);
  });

  it('should expose default screenFull=true', () => {
    expect(component.screenFull).toBe(true);
  });

  it('should accept optional input styleSelectorToggle', () => {
    fixture.componentRef.setInput('styleSelectorToggle', true);
    fixture.detectChanges();
    expect(component.styleSelectorToggle()).toBe(true);
  });

  it('should emit Customize when triggered manually', () => {
    const spy = jest.fn();
    component.Customize.subscribe(spy);
    component.Customize.emit();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should define profile menu with expected items', () => {
    expect(Array.isArray(component.profile)).toBe(true);
    expect(component.profile.length).toBeGreaterThan(0);
    expect(component.profile[0]).toEqual({ icon: 'edit', title: 'Edit Profile' });
  });

  it('should define setting menu with expected items', () => {
    expect(Array.isArray(component.setting)).toBe(true);
    expect(component.setting.length).toBeGreaterThan(0);
    expect(component.setting[0]).toEqual({ icon: 'question-circle', title: 'Support' });
  });
});
