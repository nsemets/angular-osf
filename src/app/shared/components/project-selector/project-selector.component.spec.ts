import { provideStore } from '@ngxs/store';

import { MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserState } from '@core/store/user';
import { ToastService } from '@osf/shared/services/toast.service';
import { ProjectsState } from '@shared/stores/projects';

import { ProjectSelectorComponent } from './project-selector.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('ProjectSelectorComponent', () => {
  let component: ProjectSelectorComponent;
  let fixture: ComponentFixture<ProjectSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectSelectorComponent],
      providers: [provideOSFCore(), MockProvider(ToastService), provideStore([ProjectsState, UserState])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle project selection', () => {
    jest.spyOn(component.projectChange, 'emit');
    const mockProject = { id: '1', title: 'Test Project' } as any;
    const mockEvent = { value: mockProject };

    component.handleProjectChange(mockEvent as any);

    expect(component.projectChange.emit).toHaveBeenCalledWith(mockProject);
  });

  it('should handle filter search', () => {
    const mockEvent = {
      originalEvent: { preventDefault: jest.fn() },
      filter: 'test filter',
    };

    component.handleFilterSearch(mockEvent as any);

    expect(mockEvent.originalEvent.preventDefault).toHaveBeenCalled();
  });
});
