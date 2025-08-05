import { Store } from '@ngxs/store';

import { MockProvider } from 'ng-mocks';

import { SelectChangeEvent } from 'primeng/select';

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  PreprintsResourcesFiltersSelectors,
  SetDateCreated,
} from '@osf/features/preprints/store/preprints-resources-filters';
import {
  GetAllOptions,
  PreprintsResourcesFiltersOptionsSelectors,
} from '@osf/features/preprints/store/preprints-resources-filters-options';
import { MOCK_STORE } from '@osf/shared/mocks';
import { DateCreated } from '@osf/shared/models';

import { PreprintsDateCreatedFilterComponent } from './preprints-date-created-filter.component';

describe('PreprintsDateCreatedFilterComponent', () => {
  let component: PreprintsDateCreatedFilterComponent;
  let fixture: ComponentFixture<PreprintsDateCreatedFilterComponent>;

  const mockStore = MOCK_STORE;

  const mockDates: DateCreated[] = [
    { value: '2024', count: 10 },
    { value: '2023', count: 5 },
  ];

  beforeEach(async () => {
    (mockStore.selectSignal as jest.Mock).mockImplementation((selector) => {
      if (selector === PreprintsResourcesFiltersOptionsSelectors.getDatesCreated) {
        return signal(mockDates);
      }
      if (selector === PreprintsResourcesFiltersSelectors.getDateCreated) {
        return signal({ label: '', value: '' });
      }
      return signal(null);
    });

    await TestBed.configureTestingModule({
      imports: [PreprintsDateCreatedFilterComponent],
      providers: [MockProvider(Store, mockStore)],
    }).compileComponents();

    fixture = TestBed.createComponent(PreprintsDateCreatedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map available dates to options list correctly', () => {
    const options = component['datesOptions']();
    expect(options.length).toBe(2);
    expect(options[0]).toEqual({ label: '2024 (10)', value: '2024' });
    expect(options[1]).toEqual({ label: '2023 (5)', value: '2023' });
  });

  it('should dispatch actions when setDateCreated is called', () => {
    const event = {
      originalEvent: { pointerId: 1 } as PointerEvent,
      value: '2024',
    } as unknown as SelectChangeEvent;

    component.setDateCreated(event);
    expect(mockStore.dispatch).toHaveBeenCalledWith(new SetDateCreated('2024'));
    expect(mockStore.dispatch).toHaveBeenCalledWith(new GetAllOptions());
  });
});
