import { MockProviders } from 'ng-mocks';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationSentDialogComponent } from './confirmation-sent-dialog.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('ConfirmationSentDialogComponent', () => {
  let component: ConfirmationSentDialogComponent;
  let fixture: ComponentFixture<ConfirmationSentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationSentDialogComponent],
      providers: [
        provideOSFCore(),
        MockProviders(DynamicDialogRef, DynamicDialogConfig),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationSentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
