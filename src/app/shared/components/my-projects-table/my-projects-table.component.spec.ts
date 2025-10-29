import { MockComponent } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortOrder } from '@osf/shared/enums/sort-order.enum';
import { TableParameters } from '@osf/shared/models/table-parameters.model';
import { MyResourcesItem } from '@shared/models/my-resources/my-resources.models';

import { IconComponent } from '../icon/icon.component';

import { MyProjectsTableComponent } from './my-projects-table.component';

import { MOCK_CONTRIBUTOR } from '@testing/mocks/contributors.mock';
import { TranslateServiceMock } from '@testing/mocks/translate.service.mock';

describe('MyProjectsTableComponent', () => {
  let component: MyProjectsTableComponent;
  let fixture: ComponentFixture<MyProjectsTableComponent>;

  const mockTableParams: TableParameters = {
    rows: 10,
    paginator: true,
    scrollable: true,
    rowsPerPageOptions: [5, 10, 20],
    totalRecords: 100,
    firstRowIndex: 0,
    defaultSortOrder: SortOrder.Asc,
    defaultSortColumn: 'name',
  };

  const mockItems: MyResourcesItem[] = [
    {
      id: 'project-1',
      title: 'Test Project 1',
      isPublic: true,
      dateModified: '2024-01-01T10:00:00Z',
      contributors: [MOCK_CONTRIBUTOR],
      type: '',
      dateCreated: '',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProjectsTableComponent, MockComponent(IconComponent)],
      providers: [TranslateServiceMock],
    }).compileComponents();

    fixture = TestBed.createComponent(MyProjectsTableComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('items', mockItems);
    fixture.componentRef.setInput('tableParams', mockTableParams);
    fixture.componentRef.setInput('sortColumn', 'title');
    fixture.componentRef.setInput('sortOrder', SortOrder.Asc);
    fixture.componentRef.setInput('isLoading', false);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set items input', () => {
    expect(component.items()).toEqual(mockItems);
  });

  it('should set tableParams input', () => {
    expect(component.tableParams()).toEqual(mockTableParams);
  });

  it('should set sortColumn input', () => {
    expect(component.sortColumn()).toBe('title');
  });

  it('should set sortOrder input', () => {
    expect(component.sortOrder()).toBe(SortOrder.Asc);
  });

  it('should set isLoading input', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should render table when not loading', () => {
    const compiled = fixture.nativeElement;
    const table = compiled.querySelector('p-table');

    expect(table).toBeTruthy();
  });

  it('should render table headers', () => {
    const compiled = fixture.nativeElement;
    const headers = compiled.querySelectorAll('th');

    expect(headers.length).toBeGreaterThan(0);
  });

  it('should render table rows for items', () => {
    const compiled = fixture.nativeElement;
    const rows = compiled.querySelectorAll('tr');

    expect(rows.length).toBeGreaterThan(1);
  });

  it('should render project title', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('span.overflow-ellipsis');

    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Test Project 1');
  });

  it('should render modified date', () => {
    const compiled = fixture.nativeElement;
    const dateElement = compiled.querySelector('td:last-child');

    expect(dateElement).toBeTruthy();
  });

  it('should handle empty items array', () => {
    fixture.componentRef.setInput('items', []);
    fixture.detectChanges();

    expect(component.items()).toEqual([]);
    expect(component.items().length).toBe(0);
  });

  it('should handle undefined items', () => {
    fixture.componentRef.setInput('items', undefined);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const table = compiled.querySelector('p-table');

    expect(table).toBeTruthy();
  });

  it('should handle null items', () => {
    fixture.componentRef.setInput('items', null);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const table = compiled.querySelector('p-table');

    expect(table).toBeTruthy();
  });

  it('should render sortable columns', () => {
    const compiled = fixture.nativeElement;
    const sortableColumns = compiled.querySelectorAll('th[pSortableColumn]');

    expect(sortableColumns.length).toBeGreaterThan(0);
  });

  it('should render sort icons', () => {
    const compiled = fixture.nativeElement;
    const sortIcons = compiled.querySelectorAll('p-sortIcon');

    expect(sortIcons.length).toBeGreaterThan(0);
  });

  it('should handle different sort orders', () => {
    fixture.componentRef.setInput('sortOrder', SortOrder.Desc);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const table = compiled.querySelector('p-table');

    expect(table).toBeTruthy();
  });

  it('should handle different sort columns', () => {
    fixture.componentRef.setInput('sortColumn', 'dateModified');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const table = compiled.querySelector('p-table');

    expect(table).toBeTruthy();
  });
});
