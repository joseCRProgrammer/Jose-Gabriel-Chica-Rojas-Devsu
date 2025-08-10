import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductTable, TableColumn } from './product-table';

interface Row {
  id?: any;
  name?: any;
  price?: any;
  desc?: any;
}

describe('ProductTable', () => {
  let fixture: ComponentFixture<ProductTable<any>>;
  let component: ProductTable<Row>;

  const cols: TableColumn<Row>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'price', header: 'Precio', sortable: true },
    { key: 'desc', header: 'Descripción', accessor: (r) => String(r.desc ?? '').toUpperCase() },
    { key: 'nosort', header: 'NoSort' },
  ];

  const data: Row[] = [
    { id: 3, name: 'Banana', price: 12, desc: 'amarillo' },
    { id: 1, name: 'apple', price: 5, desc: 'rojo' },
    { id: 2, name: 'cherry', price: 20, desc: 'dulce' },
    { id: 5, name: 'date', price: null, desc: 'seco' },
    { id: 4, name: null, price: 7, desc: 'sin nombre' },
    { id: null, name: 'Éclair', price: 5, desc: 'crema' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTable],
    })
      .overrideComponent(ProductTable, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(ProductTable);
    component = fixture.componentInstance as ProductTable<Row>;

    component.columns = cols;
    component.data = data;
    component.pageSize = 5;
    component.page = 1;
    component.showActions = true;
    component.loading = false;
    component.errorMsg = null;
  });

  function names(view = component.viewRows) {
    return view.map((r) => r.name);
  }

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges: calcula viewRows y totalFiltered (sin filtros, sin orden)', () => {
    component.ngOnChanges({} as any);
    expect(component.totalFiltered).toBe(data.length);
    expect(component.viewRows.length).toBe(5);
    expect(component.viewRows[0]).toEqual(data[0]);
    expect(component.viewRows[4]).toEqual(data[4]);
  });

  it('applyFilter: filtra sobre todas las columnas (incluyendo accessor), resetea a página 1', () => {
    component.ngOnChanges({} as any);

    component.applyFilter('dul');
    expect(component.page).toBe(1);
    expect(component.totalFiltered).toBe(1);
    expect(component.viewRows.length).toBe(1);
    expect(component.viewRows[0].name).toBe('cherry');

    component.applyFilter('apple');
    expect(component.totalFiltered).toBe(1);
    expect(component.viewRows[0].name).toBe('apple');

    component.applyFilter('5');
    expect(component.totalFiltered).toBe(3);
    const matchedIds = component.viewRows.map((r) => r.id);
    expect(matchedIds).toEqual(expect.arrayContaining([1, 5, null]));
    expect(matchedIds.length).toBe(3);

    component.applyFilter('');
    expect(component.totalFiltered).toBe(data.length);
    expect(component.viewRows.length).toBe(5);
  });

  it('changePageSize: cambia tamaño de página y resetea a la página 1', () => {
    component.ngOnChanges({} as any);

    component.goTo(2);
    expect(component.page).toBe(2);

    component.changePageSize(2);
    expect(component.pageSize).toBe(2);
    expect(component.page).toBe(1);
    expect(component.viewRows.length).toBe(2);
    expect(component.viewRows[0]).toEqual(data[0]);

    const prevSize = component.pageSize;
    component.changePageSize(0 as any);
    component.changePageSize(-5 as any);
    component.changePageSize(NaN as any);
    expect(component.pageSize).toBe(prevSize);
  });

  it('sortBy: ordena por columna (asc/desc). Strings y números', () => {
    component.ngOnChanges({} as any);

    component.sortBy(cols[1]);
    expect(component.sortKey).toBe('name');
    expect(component.sortDir).toBe('asc');
    (component as any).pageSize = 100;
    (component as any).recompute(false);
    const ascNames = names();
    expect(ascNames).toEqual([null, 'apple', 'Banana', 'cherry', 'date', 'Éclair']);

    component.sortBy(cols[1]);
    expect(component.sortDir).toBe('desc');
    (component as any).recompute(false);
    const descNames = names();
    expect(descNames[0]).toBe('Éclair');
    expect(descNames[descNames.length - 1]).toBeNull();

    component.sortBy(cols[2]);
    expect(component.sortKey).toBe('price');
    expect(component.sortDir).toBe('asc');
    (component as any).recompute(false);
    const pricesAsc = component.viewRows.map((r) => r.price);
    expect(pricesAsc.slice(0, 2)).toEqual([null, 5]);

    component.sortBy(cols[2]);
    (component as any).recompute(false);
    const pricesDesc = component.viewRows.map((r) => r.price);
    expect(pricesDesc[pricesDesc.length - 1]).toBeNull();
  });

  it('sortBy: ignora columnas no ordenables', () => {
    component.ngOnChanges({} as any);
    const prevKey = component.sortKey;
    component.sortBy(cols[4]);
    expect(component.sortKey).toBe(prevKey);
  });

  it('goTo: delimita la página entre 1 y max, recalcula viewRows', () => {
    component.pageSize = 2;
    component.ngOnChanges({} as any);

    component.goTo(0);
    expect(component.page).toBe(1);
    expect(component.viewRows).toEqual(data.slice(0, 2));

    component.goTo(999);
    expect(component.page).toBe(3);
    expect(component.viewRows).toEqual(data.slice(4, 6));

    component.goTo(2);
    expect(component.page).toBe(2);
    expect(component.viewRows).toEqual(data.slice(2, 4));
  });

  it('onActionClick: emite { actionId, row }', () => {
    const spy = jest.spyOn(component.action, 'emit');
    const row = data[1];
    component.onActionClick('edit', row);
    expect(spy).toHaveBeenCalledWith({ actionId: 'edit', row });
  });

  it('rowLabel: usa name, luego id, luego ""', () => {
    expect(component.rowLabel({ name: 'X' })).toBe('X');
    expect(component.rowLabel({ id: 123 })).toBe('123');
    expect(component.rowLabel({})).toBe('');
  });

  it('trackRow: devuelve id si existe; si no, el index', () => {
    expect(component.trackRow(7, { id: 'abc' } as any)).toBe('abc');
    expect(component.trackRow(3, {} as any)).toBe(3);
  });

  it('cell: devuelve valor por key o usa accessor si existe', () => {
    const r = { id: 10, name: 'x', desc: 'hola' };
    const c1 = { key: 'name', header: 'n' } as TableColumn<Row>;
    const c2 = { key: 'desc', header: 'd', accessor: (row: any) => `[${row.desc}]` } as TableColumn<Row>;

    expect(component.cell(r, c1)).toBe('x');
    expect(component.cell(r, c2)).toBe('[hola]');
    expect(component.cell({} as any, c1)).toBeUndefined();
  });

  it('recompute: con resetSort=true limpia sortKey/dir y aplica filtro + paginación', () => {
    component.columns = cols;
    component.data = data;
    component.sortKey = 'name';
    component.sortDir = 'desc';
    component.term = 'a';
    component.pageSize = 2;

    (component as any).recompute(true);

    expect(component.sortKey).toBeNull();
    expect(component.sortDir).toBe('asc');
    expect(component.totalFiltered).toBeGreaterThan(0);
    expect(component.viewRows.length).toBeLessThanOrEqual(2);
  });

  it('recompute: orden con nulls y tipos mixtos respeta reglas del comparator', () => {
    component.columns = cols;
    component.data = [
      { id: 1, name: null, price: 10 },
      { id: 2, name: 'alpha', price: '7' },
      { id: 3, name: undefined, price: 3 },
      { id: 4, name: 'Beta', price: '15' },
    ];
    component.pageSize = 100;

    component.sortBy(cols[1]);
    const v1 = component.viewRows.map((r) => r.name);
    expect(v1.slice(0, 2)).toEqual([null, undefined]);
    expect(v1.slice(2)).toEqual(['alpha', 'Beta']);

    component.sortBy(cols[2]);
    const v2 = component.viewRows.map((r) => Number(r.price));
    expect(v2).toEqual([3, 7, 10, 15]);
  });
});
