import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { Component, TemplateRef, ViewChild } from '@angular/core';

@Component({
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card
      [cardTitle]="'Título de prueba'"
      [cardClass]="'custom-card'"
      [showContent]="false"
      [blockClass]="'bloque-css'"
      [headerClass]="'header-css'"
      [showHeader]="false"
      [padding]="10"
    >
      <ng-template #headerOptionsTemplate>Opciones header</ng-template>
      <ng-template #headerTitleTemplate>Título header</ng-template>
    </app-card>
  `
})
class HostTestComponent {
  @ViewChild(CardComponent) cardComponent!: CardComponent;
}

describe('CardComponent', () => {
  let fixture: ComponentFixture<HostTestComponent>;
  let host: HostTestComponent;
  let component: CardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostTestComponent] // NO usar declarations con standalone
    }).compileComponents();

    fixture = TestBed.createComponent(HostTestComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = host.cardComponent;
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener valores por defecto cuando no se pasan inputs', () => {
    const defFix = TestBed.createComponent(CardComponent);
    const defComp = defFix.componentInstance;
    defFix.detectChanges();

    expect(defComp.showContent()).toBe(true);
    expect(defComp.showHeader()).toBe(true);
    expect(defComp.padding()).toBe(20);
    expect(defComp.cardTitle()).toBeUndefined();
    expect(defComp.cardClass()).toBeUndefined();
    expect(defComp.blockClass()).toBeUndefined();
    expect(defComp.headerClass()).toBeUndefined();
  });

  it('debe tomar los valores pasados por input desde el host', () => {
    expect(component.cardTitle()).toBe('Título de prueba');
    expect(component.cardClass()).toBe('custom-card');
    expect(component.showContent()).toBe(false);
    expect(component.blockClass()).toBe('bloque-css');
    expect(component.headerClass()).toBe('header-css');
    expect(component.showHeader()).toBe(false);
    expect(component.padding()).toBe(10);
  });

  it('debe tener definidos los ContentChild templates cuando se proveen', () => {
    expect(component.headerOptionsTemplate).toBeInstanceOf(TemplateRef);
    expect(component.headerTitleTemplate).toBeInstanceOf(TemplateRef);
  });
});
