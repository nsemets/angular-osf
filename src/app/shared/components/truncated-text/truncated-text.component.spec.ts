import { MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { TruncatedTextComponent } from './truncated-text.component';

import { provideOSFCore } from '@testing/osf.testing.provider';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';

describe('TruncatedTextComponent', () => {
  let component: TruncatedTextComponent;
  let fixture: ComponentFixture<TruncatedTextComponent>;
  let mockRouter: RouterMockType;

  beforeEach(() => {
    mockRouter = RouterMockBuilder.create().build();

    TestBed.configureTestingModule({
      imports: [TruncatedTextComponent],
      providers: [provideOSFCore(), MockProvider(Router, mockRouter)],
    });

    fixture = TestBed.createComponent(TruncatedTextComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should reflect text, maxVisibleLines, and expanded inputs', () => {
    fixture.componentRef.setInput('text', 'hello');
    fixture.componentRef.setInput('maxVisibleLines', 5);
    fixture.componentRef.setInput('expanded', true);

    expect(component.text()).toBe('hello');
    expect(component.maxVisibleLines()).toBe(5);
    expect(component.expanded()).toBe(true);
  });

  it('should derive isExpanded from expanded input or user expansion', () => {
    expect(component.isExpanded()).toBe(false);

    fixture.componentRef.setInput('expanded', true);
    expect(component.isExpanded()).toBe(true);

    fixture.componentRef.setInput('expanded', false);
    component.isTextExpanded.set(true);
    expect(component.isExpanded()).toBe(true);
  });

  it('should compute buttonLabel for read-more vs hide when not navigating', () => {
    fixture.componentRef.setInput('navigateOnReadMore', false);
    fixture.componentRef.setInput('readMoreLabel', 'read');
    fixture.componentRef.setInput('hideLabel', 'hide');

    expect(component.buttonLabel()).toBe('read');

    component.isTextExpanded.set(true);
    expect(component.buttonLabel()).toBe('hide');
  });

  it('should use readMoreLabel for buttonLabel when navigateOnReadMore is true', () => {
    fixture.componentRef.setInput('navigateOnReadMore', true);
    fixture.componentRef.setInput('readMoreLabel', 'go');

    expect(component.buttonLabel()).toBe('go');

    component.isTextExpanded.set(true);
    expect(component.buttonLabel()).toBe('go');
  });

  it('should call checkTextOverflow from ngAfterViewInit', () => {
    const checkTextOverflowSpy = jest.spyOn(component, 'checkTextOverflow');

    component.ngAfterViewInit();

    expect(checkTextOverflowSpy).toHaveBeenCalledTimes(1);
  });

  it('should reset user expansion when text changes to a new non-empty value', () => {
    jest.useFakeTimers();
    try {
      fixture.componentRef.setInput('text', 'first');
      fixture.detectChanges();
      jest.advanceTimersByTime(0);

      component.isTextExpanded.set(true);
      fixture.componentRef.setInput('text', 'second');
      fixture.detectChanges();
      jest.advanceTimersByTime(0);

      expect(component.isTextExpanded()).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it('should toggle isTextExpanded on handleButtonClick when not navigateOnReadMore', () => {
    fixture.componentRef.setInput('navigateOnReadMore', false);

    expect(component.isTextExpanded()).toBe(false);

    component.handleButtonClick();
    expect(component.isTextExpanded()).toBe(true);

    component.handleButtonClick();
    expect(component.isTextExpanded()).toBe(false);
  });

  it('should navigate when navigateOnReadMore is true', () => {
    fixture.componentRef.setInput('navigateOnReadMore', true);
    fixture.componentRef.setInput('link', ['/preprints', '123']);

    component.handleButtonClick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/preprints', '123']);
  });
});
