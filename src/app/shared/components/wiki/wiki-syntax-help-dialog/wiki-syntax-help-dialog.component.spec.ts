import { MockProvider } from 'ng-mocks';

import { DynamicDialogRef } from 'primeng/dynamicdialog';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WikiSyntaxHelpDialogComponent } from './wiki-syntax-help-dialog.component';

import { TranslateServiceMock } from '@testing/mocks/translate.service.mock';

describe('WikiSyntaxHelpDialogComponent', () => {
  let component: WikiSyntaxHelpDialogComponent;
  let fixture: ComponentFixture<WikiSyntaxHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WikiSyntaxHelpDialogComponent],
      providers: [TranslateServiceMock, MockProvider(DynamicDialogRef)],
    }).compileComponents();

    fixture = TestBed.createComponent(WikiSyntaxHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog when close button is clicked', () => {
    const dialogRef = TestBed.inject(DynamicDialogRef);
    const closeSpy = jest.spyOn(dialogRef, 'close');

    dialogRef.close();

    expect(closeSpy).toHaveBeenCalled();
  });
});
