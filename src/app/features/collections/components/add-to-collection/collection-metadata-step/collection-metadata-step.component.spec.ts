import { provideStore } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';
import { MockPipe } from 'ng-mocks';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsState } from '@shared/stores';

import { CollectionMetadataStepComponent } from './collection-metadata-step.component';

describe('CollectionMetadataStepComponent', () => {
  let component: CollectionMetadataStepComponent;
  let fixture: ComponentFixture<CollectionMetadataStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionMetadataStepComponent, MockPipe(TranslatePipe)],
      providers: [provideStore([CollectionsState]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionMetadataStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
