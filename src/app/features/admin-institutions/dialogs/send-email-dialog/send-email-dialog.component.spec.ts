import { MockProviders } from 'ng-mocks';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendEmailDialogComponent } from './send-email-dialog.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('SendEmailDialogComponent', () => {
  let component: SendEmailDialogComponent;
  let fixture: ComponentFixture<SendEmailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendEmailDialogComponent],
      providers: [provideOSFCore(), MockProviders(DynamicDialogRef, DynamicDialogConfig)],
    }).compileComponents();

    fixture = TestBed.createComponent(SendEmailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
