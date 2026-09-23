import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideOSFCore } from '@testing/osf.testing.provider';

import { ViewOnlyLinkMessageComponent } from './view-only-link-message.component';

describe('ViewOnlyLinkMessageComponent', () => {
  let fixture: ComponentFixture<ViewOnlyLinkMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ViewOnlyLinkMessageComponent],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(ViewOnlyLinkMessageComponent);
    fixture.detectChanges();
  });

  it('should render the view-only links banner', () => {
    const message = fixture.nativeElement.querySelector('p-message[severity="info"]');

    expect(message).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('common.hint.viewOnlyLinksBanner');
  });
});
