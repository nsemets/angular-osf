import { provideStore } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';
import { MockComponents, MockPipes, MockProvider } from 'ng-mocks';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCollectionState } from '@osf/features/collections/store/add-to-collection';
import { TagsInputComponent, TextInputComponent, TruncatedTextComponent } from '@shared/components';
import { InterpolatePipe } from '@shared/pipes';
import { ToastService } from '@shared/services';
import { ProjectsState } from '@shared/stores';

import { ProjectMetadataStepComponent } from './project-metadata-step.component';

describe('ProjectMetadataStepComponent', () => {
  let component: ProjectMetadataStepComponent;
  let fixture: ComponentFixture<ProjectMetadataStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProjectMetadataStepComponent,
        ...MockComponents(TagsInputComponent, TextInputComponent, TruncatedTextComponent),
        MockPipes(InterpolatePipe, TranslatePipe),
      ],
      providers: [
        MockProvider(ToastService),
        provideStore([ProjectsState, AddToCollectionState]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectMetadataStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
