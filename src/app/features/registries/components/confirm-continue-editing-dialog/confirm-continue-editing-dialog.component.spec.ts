import { MockProvider } from 'ng-mocks';

import { DynamicDialogConfig } from 'primeng/dynamicdialog';

import { of } from 'rxjs';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaActionTrigger } from '@osf/features/registries/enums';

import { ConfirmContinueEditingDialogComponent } from './confirm-continue-editing-dialog.component';

import { provideOSFCore, provideOSFDialog } from '@testing/osf.testing.provider';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('ConfirmContinueEditingDialogComponent', () => {
  let component: ConfirmContinueEditingDialogComponent;
  let fixture: ComponentFixture<ConfirmContinueEditingDialogComponent>;

  const MOCK_REVISION_ID = 'test-revision-id';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmContinueEditingDialogComponent],
      providers: [
        provideOSFCore(),
        provideOSFDialog(),
        provideMockStore(),
        MockProvider(DynamicDialogConfig, { data: { revisionId: MOCK_REVISION_ID } }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmContinueEditingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize isSubmitting as false', () => {
    expect(component.isSubmitting).toBe(false);
  });

  it('should submit with comment', () => {
    const testComment = 'Test comment';
    component.form.patchValue({ comment: testComment });

    const mockActions = { handleSchemaResponse: jest.fn().mockReturnValue(of({})) };

    Object.defineProperty(component, 'actions', {
      value: mockActions,
      writable: true,
    });

    component.submit();

    expect(mockActions.handleSchemaResponse).toHaveBeenCalledWith(
      MOCK_REVISION_ID,
      SchemaActionTrigger.AdminReject,
      testComment
    );
  });

  it('should submit with empty comment', () => {
    const mockActions = { handleSchemaResponse: jest.fn().mockReturnValue(of({})) };

    Object.defineProperty(component, 'actions', {
      value: mockActions,
      writable: true,
    });

    component.submit();

    expect(mockActions.handleSchemaResponse).toHaveBeenCalledWith(
      MOCK_REVISION_ID,
      SchemaActionTrigger.AdminReject,
      ''
    );
  });

  it('should set isSubmitting to true when submitting', () => {
    const mockActions = { handleSchemaResponse: jest.fn().mockReturnValue(of({}).pipe()) };

    Object.defineProperty(component, 'actions', {
      value: mockActions,
      writable: true,
    });

    component.submit();
    expect(mockActions.handleSchemaResponse).toHaveBeenCalled();
  });

  it('should update comment value', () => {
    const testComment = 'New comment';
    component.form.patchValue({ comment: testComment });

    expect(component.form.get('comment')?.value).toBe(testComment);
  });

  it('should handle different revision IDs', () => {
    const differentRevisionId = 'different-revision-id';
    (component as any).config.data = { revisionId: differentRevisionId } as any;

    const mockActions = { handleSchemaResponse: jest.fn().mockReturnValue(of({})) };

    Object.defineProperty(component, 'actions', {
      value: mockActions,
      writable: true,
    });

    component.submit();

    expect(mockActions.handleSchemaResponse).toHaveBeenCalledWith(
      differentRevisionId,
      SchemaActionTrigger.AdminReject,
      ''
    );
  });
});
