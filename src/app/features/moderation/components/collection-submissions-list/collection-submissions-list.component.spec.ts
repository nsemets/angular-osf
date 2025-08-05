import { provideStore } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';
import { MockPipe } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsModerationState } from '@osf/features/moderation/store/collections-moderation';

import { CollectionSubmissionsListComponent } from './collection-submissions-list.component';

describe('SubmissionsListComponent', () => {
  let component: CollectionSubmissionsListComponent;
  let fixture: ComponentFixture<CollectionSubmissionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionSubmissionsListComponent, MockPipe(TranslatePipe)],
      providers: [provideStore([CollectionsModerationState])],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionSubmissionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
