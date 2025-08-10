import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ButtonComponent } from './button';

describe('ButtonComponent', () => {
  let component: ButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ButtonComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideComponent(ButtonComponent, {
      set: { template: '<div></div>' },
    });

    const fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('valores por defecto', () => {
    expect(component.label).toBe('');
    expect(component.color).toBe('gray');
    expect(component.disabled).toBe(false);
  });

  it('onClick: emite evento cuando disabled=false', () => {
    const emitSpy = jest.spyOn(component.clicked, 'emit');
    component.disabled = false;

    component.onClick();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('onClick: NO emite evento cuando disabled=true', () => {
    const emitSpy = jest.spyOn(component.clicked, 'emit');
    component.disabled = true;

    component.onClick();

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
