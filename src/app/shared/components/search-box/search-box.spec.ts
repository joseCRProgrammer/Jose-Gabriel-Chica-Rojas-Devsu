import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBox } from './search-box';
import { By } from '@angular/platform-browser';

describe('SearchBox', () => {
  let component: SearchBox;
  let fixture: ComponentFixture<SearchBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBox],
    })
      .overrideComponent(SearchBox, {
        set: {
          template: `
            <input
              type="text"
              [placeholder]="placeholder"
              [(ngModel)]="query"
              (input)="onSearchChange()"
            />
          `,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(SearchBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener placeholder por defecto "Buscar..."', () => {
    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.getAttribute('placeholder')).toBe('Buscar...');
  });

  it('debe permitir cambiar el placeholder', () => {
    component.placeholder = 'Escribe aquí...';
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    expect(input.getAttribute('placeholder')).toBe('Escribe aquí...');
  });

  it('debe emitir el valor de query cuando se llama onSearchChange()', () => {
    const spy = jest.spyOn(component.searchChange, 'emit');
    component.query = 'Angular';
    component.onSearchChange();
    expect(spy).toHaveBeenCalledWith('Angular');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('debe emitir el valor cuando cambia el input', () => {
    const spy = jest.spyOn(component.searchChange, 'emit');
    const input: HTMLInputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    input.value = 'Test';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.query).toBe('Test');
    expect(spy).toHaveBeenCalledWith('Test');
  });
});
