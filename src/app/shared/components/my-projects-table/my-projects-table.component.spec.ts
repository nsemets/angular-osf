import { MockComponents } from 'ng-mocks';

import { SortEvent } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortOrder } from '@osf/shared/enums/sort-order.enum';
import { MyResourcesItem } from '@osf/shared/models/my-resources/my-resources.model';
import { TableParameters } from '@osf/shared/models/table-parameters.model';

import { MOCK_CONTRIBUTOR } from '@testing/mocks/contributors.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

import { ContributorsListShortenerComponent } from '../contributors-list-shortener/contributors-list-shortener.component';
import { IconComponent } from '../icon/icon.component';

import { MyProjectsTableComponent } from './my-projects-table.component';

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

  const mockItem: MyResourcesItem = {
    id: 'project-1',
    title: 'Test Project 1',
    isPublic: true,
    dateModified: '2024-01-01T10:00:00Z',
    contributors: [MOCK_CONTRIBUTOR],
    type: 'nodes',
    dateCreated: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MyProjectsTableComponent, ...MockComponents(IconComponent, ContributorsListShortenerComponent)],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(MyProjectsTableComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('tableParams', mockTableParams);
    fixture.detectChanges();
  });

  it('should create with default input values', () => {
    expect(component).toBeTruthy();
    expect(component.items()).toEqual([]);
    expect(component.tableParams()).toEqual(mockTableParams);
    expect(component.sortColumn()).toBeUndefined();
    expect(component.sortOrder()).toBe(SortOrder.Asc);
    expect(component.isLoading()).toBe(false);
    expect(component.emptyMessageKey()).toBe('common.search.noResultsFound');
  });

  it('should accept configured inputs', () => {
    fixture.componentRef.setInput('items', [mockItem]);
    fixture.componentRef.setInput('sortColumn', 'title');
    fixture.componentRef.setInput('sortOrder', SortOrder.Desc);
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('emptyMessageKey', 'myProjects.table.emptyState.projects.public');
    fixture.detectChanges();

    expect(component.items()).toEqual([mockItem]);
    expect(component.sortColumn()).toBe('title');
    expect(component.sortOrder()).toBe(SortOrder.Desc);
    expect(component.isLoading()).toBe(true);
    expect(component.emptyMessageKey()).toBe('myProjects.table.emptyState.projects.public');
  });

  it('should initialize skeletonData with ten placeholder items', () => {
    expect(component.skeletonData).toHaveLength(10);
  });

  it('should emit pageChange when onPageChange is called', () => {
    vi.spyOn(component.pageChange, 'emit');
    const event = { first: 10, rows: 10 } as TablePageEvent;

    component.onPageChange(event);

    expect(component.pageChange.emit).toHaveBeenCalledWith(event);
  });

  it('should emit sort when onSort is called', () => {
    vi.spyOn(component.sort, 'emit');
    const event = { field: 'title', order: SortOrder.Desc } as SortEvent;

    component.onSort(event);

    expect(component.sort.emit).toHaveBeenCalledWith(event);
  });

  it('should emit itemClick when onItemClick is called', () => {
    vi.spyOn(component.itemClick, 'emit');

    component.onItemClick(mockItem);

    expect(component.itemClick.emit).toHaveBeenCalledWith(mockItem);
  });
});
