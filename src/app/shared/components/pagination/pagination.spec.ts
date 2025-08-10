import { TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination';
import { SimpleChanges } from '@angular/core';

jest.mock('./utils/pagination-utils', () => ({
  paginate: jest.fn(),
}));

import { paginate } from './utils/pagination-utils';

type PaginateFn = jest.MockedFunction<typeof paginate>;

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let paginateMock: PaginateFn;

  beforeEach(async () => {
    paginateMock = paginate as PaginateFn;

    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    })
      .overrideComponent(PaginationComponent, { set: { template: '' } })
      .compileComponents();

    const fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;

    component.total = 0;
    component.pageSize = 10;
    component.page = 1;
    component.pageSizeOptions = [5, 10, 20];
    component.showSizeSelector = true;
    component.maxButtons = 5;
    component.edgeButtons = true;

    jest.clearAllMocks();

    paginateMock.mockReturnValue({
      totalPages: 1,
      visible: [1],
      showStartEllipsis: false,
      showEndEllipsis: false,
      currentPage: 1,
    });
  });

  function stubState(overrides?: Partial<PaginationComponent['state']>) {
    const base = {
      totalPages: 1,
      visible: [1],
      showStartEllipsis: false,
      showEndEllipsis: false,
      currentPage: 1,
    };
    return { ...base, ...overrides };
  }

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnChanges: calcula estado y sincroniza page con currentPage', () => {
    component.total = 100;
    component.pageSize = 10;
    component.page = 5;
    component.maxButtons = 7;
    component.edgeButtons = false;

    paginateMock.mockReturnValueOnce(
      stubState({ totalPages: 10, currentPage: 5, visible: [3, 4, 5, 6, 7] })
    );

    component.ngOnChanges({} as SimpleChanges);

    expect(paginateMock).toHaveBeenCalledWith(100, 10, 5, 7, false);
    expect(component.state.totalPages).toBe(10);
    expect(component.state.currentPage).toBe(5);
    expect(component.page).toBe(5);
  });

  it('ngOnChanges: ajusta page si viene fuera de rango (sincroniza con currentPage)', () => {
    component.total = 100;
    component.pageSize = 10;
    component.page = 999;

    paginateMock.mockReturnValueOnce(
      stubState({ totalPages: 10, currentPage: 10 })
    );

    component.ngOnChanges({} as SimpleChanges);

    expect(paginateMock).toHaveBeenCalledWith(100, 10, 999, 5, true);
    expect(component.page).toBe(10);
  });

  it('prev: llama goto(currentPage-1) si currentPage > 1', () => {
    component.state = stubState({ totalPages: 10, currentPage: 3 });

    paginateMock.mockReturnValueOnce(
      stubState({ totalPages: 10, currentPage: 2, visible: [1, 2, 3, 4, 5] })
    );

    const gotoSpy = jest.spyOn(component, 'goto');
    component.prev();

    expect(gotoSpy).toHaveBeenCalledWith(2);
    expect(component.page).toBe(2);
    expect(component.state.currentPage).toBe(2);
  });

  it('prev: no hace nada si currentPage == 1', () => {
    component.state = stubState({ totalPages: 10, currentPage: 1 });
    const gotoSpy = jest.spyOn(component, 'goto');

    component.prev();

    expect(gotoSpy).not.toHaveBeenCalled();
  });

  it('next: llama goto(currentPage+1) si currentPage < totalPages', () => {
    component.state = stubState({ totalPages: 10, currentPage: 3 });

    paginateMock.mockReturnValueOnce(
      stubState({ totalPages: 10, currentPage: 4, visible: [2, 3, 4, 5, 6] })
    );

    const gotoSpy = jest.spyOn(component, 'goto');
    component.next();

    expect(gotoSpy).toHaveBeenCalledWith(4);
    expect(component.page).toBe(4);
    expect(component.state.currentPage).toBe(4);
  });

  it('next: no hace nada si currentPage == totalPages', () => {
    component.state = stubState({ totalPages: 3, currentPage: 3 });
    const gotoSpy = jest.spyOn(component, 'goto');

    component.next();

    expect(gotoSpy).not.toHaveBeenCalled();
  });

  it('goto: ignora si p < 1', () => {
    component.state = stubState({ totalPages: 10, currentPage: 3 });
    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const pageEmits: number[] = [];
    component.pageChange.subscribe(v => pageEmits.push(v));

    component.goto(0);

    expect(pageEmits).toHaveLength(0);
    expect(recomputeSpy).not.toHaveBeenCalled();
  });

  it('goto: ignora si p > totalPages', () => {
    component.state = stubState({ totalPages: 4, currentPage: 2 });
    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const pageEmits: number[] = [];
    component.pageChange.subscribe(v => pageEmits.push(v));

    component.goto(5);

    expect(pageEmits).toHaveLength(0);
    expect(recomputeSpy).not.toHaveBeenCalled();
  });

  it('goto: ignora si p == currentPage', () => {
    component.state = stubState({ totalPages: 10, currentPage: 7 });
    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const pageEmits: number[] = [];
    component.pageChange.subscribe(v => pageEmits.push(v));

    component.goto(7);

    expect(pageEmits).toHaveLength(0);
    expect(recomputeSpy).not.toHaveBeenCalled();
  });

  it('goto: emite pageChange, actualiza page y recomputa cuando es válido', () => {
    component.total = 50;
    component.pageSize = 10;
    component.page = 3;
    component.maxButtons = 5;
    component.edgeButtons = true;
    component.state = stubState({ totalPages: 5, currentPage: 3 });

    paginateMock.mockReturnValueOnce(
      stubState({ totalPages: 5, currentPage: 4, visible: [2, 3, 4, 5] })
    );

    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const pageEmits: number[] = [];
    component.pageChange.subscribe(v => pageEmits.push(v));

    component.goto(4);

    expect(pageEmits).toEqual([4]);
    expect(component.page).toBe(4);
    expect(recomputeSpy).toHaveBeenCalled();

    expect(paginateMock).toHaveBeenCalledWith(50, 10, 4, 5, true);
    expect(component.state.currentPage).toBe(4);
  });

  it('onChangeSize: ignora valores no numéricos', () => {
    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const sizeEmits: number[] = [];
    component.pageSizeChange.subscribe(v => sizeEmits.push(v));

    component.pageSize = 10;
    component.onChangeSize('abc');

    expect(sizeEmits).toHaveLength(0);
    expect(recomputeSpy).not.toHaveBeenCalled();
    expect(component.pageSize).toBe(10);
  });

  it('onChangeSize: ignora valores <= 0', () => {
    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const sizeEmits: number[] = [];
    component.pageSizeChange.subscribe(v => sizeEmits.push(v));

    component.pageSize = 10;
    component.onChangeSize('0');

    expect(sizeEmits).toHaveLength(0);
    expect(recomputeSpy).not.toHaveBeenCalled();
    expect(component.pageSize).toBe(10);
  });

  it('onChangeSize: ignora si es igual al pageSize actual', () => {
    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const sizeEmits: number[] = [];
    component.pageSizeChange.subscribe(v => sizeEmits.push(v));

    component.pageSize = 10;
    component.onChangeSize('10');

    expect(sizeEmits).toHaveLength(0);
    expect(recomputeSpy).not.toHaveBeenCalled();
    expect(component.pageSize).toBe(10);
  });

  it('onChangeSize: acepta string numérico válido, emite, resetea page y recomputa', () => {
    component.total = 200;
    component.pageSize = 10;
    component.page = 5;
    component.maxButtons = 9;
    component.edgeButtons = false;

    paginateMock.mockReturnValueOnce(
      stubState({ totalPages: 20, currentPage: 1, visible: [1, 2, 3] })
    );

    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const sizeEmits: number[] = [];
    component.pageSizeChange.subscribe(v => sizeEmits.push(v));

    component.onChangeSize('20');

    expect(sizeEmits).toEqual([20]);
    expect(component.pageSize).toBe(20);
    expect(component.page).toBe(1);
    expect(recomputeSpy).toHaveBeenCalled();
    expect(paginateMock).toHaveBeenCalledWith(200, 20, 1, 9, false);
  });

  it('onChangeSize: acepta number válido, emite, resetea page y recomputa', () => {
    component.total = 45;
    component.pageSize = 15;
    component.page = 2;

    paginateMock.mockReturnValueOnce(
      stubState({ totalPages: 3, currentPage: 1 })
    );

    const recomputeSpy = jest.spyOn<any, any>(component as any, 'recompute');
    const sizeEmits: number[] = [];
    component.pageSizeChange.subscribe(v => sizeEmits.push(v));

    component.onChangeSize(5);

    expect(sizeEmits).toEqual([5]);
    expect(component.pageSize).toBe(5);
    expect(component.page).toBe(1);
    expect(recomputeSpy).toHaveBeenCalled();
    expect(paginateMock).toHaveBeenCalledWith(45, 5, 1, 5, true);
  });

  it('trackByPage: devuelve el valor (p)', () => {
    expect(component.trackByPage(0, 7)).toBe(7);
    expect(component.trackByPage(1, 42)).toBe(42);
  });
});
