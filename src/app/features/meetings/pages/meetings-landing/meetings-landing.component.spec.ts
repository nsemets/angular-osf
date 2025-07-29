import { provideStore } from '@ngxs/store';

import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MockComponents, MockPipe, MockProvider } from 'ng-mocks';

import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

import { of } from 'rxjs';

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MOCK_MEETING } from '@osf/shared/mocks';
import { SearchInputComponent, SubHeaderComponent } from '@shared/components';
import { TABLE_PARAMS } from '@shared/constants';
import { SortOrder } from '@shared/enums';

import { MeetingsFeatureCardComponent } from '../../components';
import { MEETINGS_FEATURE_CARDS, PARTNER_ORGANIZATIONS } from '../../constants';

import { MeetingsLandingComponent } from './meetings-landing.component';

const mockQueryParams = {
  page: 1,
  size: 10,
  search: '',
  sortColumn: 'name',
  sortOrder: SortOrder.Asc,
};

const mockActivatedRoute = {
  queryParams: of(mockQueryParams),
};

const mockRouter = {
  navigate: jest.fn(),
};

describe('MeetingsLandingComponent', () => {
  let component: MeetingsLandingComponent;
  let fixture: ComponentFixture<MeetingsLandingComponent>;
  let router: Router;
  const mockMeeting = MOCK_MEETING;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MeetingsLandingComponent,
        ...MockComponents(SubHeaderComponent, SearchInputComponent, MeetingsFeatureCardComponent),
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        TableModule,
        Skeleton,
        MockPipe(TranslatePipe),
      ],
      providers: [MockProvider(ActivatedRoute, mockActivatedRoute), MockProvider(Router, mockRouter), provideStore([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingsLandingComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create and have correct initial signals', () => {
    expect(component).toBeTruthy();
    expect(component.searchControl).toBeInstanceOf(FormControl);
    expect(component.partnerOrganizations).toEqual(PARTNER_ORGANIZATIONS);
    expect(component.meetingsFeatureCards).toEqual(MEETINGS_FEATURE_CARDS);
    expect(component.skeletonData).toHaveLength(10);
    expect(component.tableParams().rows).toBe(TABLE_PARAMS.rows);
    expect(component.tableParams().firstRowIndex).toBe(0);
    expect(component.currentPage()).toBe(1);
    expect(component.currentPageSize()).toBe(TABLE_PARAMS.rows);
    expect(component.sortColumn()).toBe('');
    expect(component.sortOrder()).toBe(SortOrder.Asc);
  });

  it('should navigate to meeting when navigateToMeeting is called', () => {
    component.navigateToMeeting(mockMeeting);
    expect(router.navigate).toHaveBeenCalledWith(['/meetings', '1']);
  });

  describe('router.navigate scenarios', () => {
    const cases = [
      {
        name: 'onPageChange',
        action: (c: MeetingsLandingComponent) => c.onPageChange({ first: 40, rows: 20 }),
        expected: { page: '3', size: '20' },
      },
      {
        name: 'onSort ascending',
        action: (c: MeetingsLandingComponent) => c.onSort({ field: 'location', order: 1 }),
        expected: { sortColumn: 'location', sortOrder: 'asc' },
      },
      {
        name: 'onSort descending',
        action: (c: MeetingsLandingComponent) => c.onSort({ field: 'location', order: -1 }),
        expected: { sortColumn: 'location', sortOrder: 'desc' },
      },
      {
        name: 'onSort with bad params (order=undefined)',
        action: (c: MeetingsLandingComponent) => c.onSort({ field: 'location', order: undefined }),
        expected: { sortColumn: 'location', sortOrder: 'asc' },
      },
    ];
    cases.forEach(({ name, action, expected }) => {
      it(`should call router.navigate with correct params: ${name}`, () => {
        jest.clearAllMocks();
        action(component);
        if (expected) {
          expect(router.navigate).toHaveBeenCalledWith(
            [],
            expect.objectContaining({
              queryParams: expect.objectContaining(expected),
              queryParamsHandling: 'merge',
            })
          );
        } else {
          expect(router.navigate).not.toHaveBeenCalled();
        }
      });
    });
  });

  it('should not update query params when sort field is undefined', () => {
    jest.clearAllMocks();
    component.onSort({ field: undefined, order: 1 });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should call router.navigate with correct params on search', (done) => {
    jest.clearAllMocks();
    setTimeout(() => {
      component.searchControl.setValue('test search');
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(
          [],
          expect.objectContaining({
            queryParams: expect.objectContaining({ search: 'test search', page: '1' }),
            queryParamsHandling: 'merge',
          })
        );
        done();
      }, 350);
    }, 100);
  });

  it('should show skeletonData when isMeetingsLoading is true', () => {
    component.isMeetingsLoading = signal(true);
    expect(component.isMeetingsLoading()).toBe(true);
    expect(component.skeletonData.length).toBe(10);
  });

  it('should show empty table when meetings is empty and not loading', () => {
    component.meetings = signal([]);
    component.isMeetingsLoading = signal(false);
    expect(component.meetings().length).toBe(0);
    expect(component.isMeetingsLoading()).toBe(false);
  });

  it('should use skeletonData when meetings is empty and isMeetingsLoading is true', () => {
    component.meetings = signal([]);
    component.isMeetingsLoading = signal(true);
    const data = component.isMeetingsLoading() ? component.skeletonData : component.meetings();
    expect(data).toEqual(component.skeletonData);
    expect(data.length).toBe(10);
  });

  it('should use meetings when meetings is not empty and isMeetingsLoading is false', () => {
    component.meetings = signal([mockMeeting]);
    component.isMeetingsLoading = signal(false);
    const data = component.isMeetingsLoading() ? component.skeletonData : component.meetings();
    expect(data).toEqual([mockMeeting]);
  });

  it('should debounce search input and call router.navigate only once', (done) => {
    jest.clearAllMocks();
    component.searchControl.setValue('first');
    setTimeout(() => {
      component.searchControl.setValue('second');
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledTimes(1);
        done();
      }, 350);
    }, 100);
  });

  it('should not throw on onPageChange with rows=0', () => {
    expect(() => component.onPageChange({ first: 0, rows: 0 })).not.toThrow();
  });

  it('should not call router.navigate if onSort called with field undefined', () => {
    jest.clearAllMocks();
    component.onSort({ field: undefined, order: 1 });
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should call router.navigate with only provided queryParams', () => {
    jest.clearAllMocks();
    component.onPageChange({ first: 0, rows: 10 });
    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ page: '1', size: '10' }),
        queryParamsHandling: 'merge',
      })
    );
    jest.clearAllMocks();
    component.onSort({ field: 'name', order: 1 });
    expect(router.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: expect.objectContaining({ sortColumn: 'name', sortOrder: 'asc' }),
        queryParamsHandling: 'merge',
      })
    );
  });

  it('should use empty array when meetings is empty and isMeetingsLoading is false', () => {
    component.meetings = signal([]);
    component.isMeetingsLoading = signal(false);
    const data = component.isMeetingsLoading() ? component.skeletonData : component.meetings();
    expect(data).toEqual([]);
  });
});
