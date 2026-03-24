import { MockPipe } from 'ng-mocks';

import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitationFormatPipe } from '@shared/pipes/citation-format.pipe';

import { CitationPreviewComponent } from './citation-preview.component';

import { MOCK_USER } from '@testing/mocks/data.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';

describe('CitationPreviewComponent', () => {
  let component: CitationPreviewComponent;
  let componentRef: ComponentRef<CitationPreviewComponent>;
  let fixture: ComponentFixture<CitationPreviewComponent>;

  const mockUser = MOCK_USER;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitationPreviewComponent, MockPipe(CitationFormatPipe)],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(CitationPreviewComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('currentUser', mockUser);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
