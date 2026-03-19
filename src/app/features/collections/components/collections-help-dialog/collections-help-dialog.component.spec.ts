import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsHelpDialogComponent } from './collections-help-dialog.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('CollectionsHelpDialogComponent', () => {
  let component: CollectionsHelpDialogComponent;
  let fixture: ComponentFixture<CollectionsHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionsHelpDialogComponent],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
