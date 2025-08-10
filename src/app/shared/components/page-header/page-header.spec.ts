import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  let component: PageHeader;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PageHeader],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(PageHeader, {
      set: { template: '<div></div>' },
    });

    const fixture = TestBed.createComponent(PageHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('valores por defecto', () => {
    expect(component.title).toBe('');
    expect(component.icon).toBeNull();
    expect(component.iconSize).toBe(22);
    expect(component.showDivider).toBe(false);
  });

  it('isMaterialIcon: false si icon es null', () => {
    component.icon = null;
    expect(component.isMaterialIcon).toBe(false);
  });

  it('isMaterialIcon: true si icon contiene solo letras, números y guiones bajos', () => {
    component.icon = 'home_icon1';
    expect(component.isMaterialIcon).toBe(true);
  });

  it('isMaterialIcon: false si icon contiene caracteres inválidos', () => {
    component.icon = 'home-icon!';
    expect(component.isMaterialIcon).toBe(false);
  });
});
