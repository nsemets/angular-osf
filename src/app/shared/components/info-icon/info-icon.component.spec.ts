import { TranslatePipe } from '@ngx-translate/core';
import { MockPipe } from 'ng-mocks';

import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoIconComponent } from './info-icon.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('InfoIconComponent', () => {
  let component: InfoIconComponent;
  let fixture: ComponentFixture<InfoIconComponent>;
  let componentRef: ComponentRef<InfoIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoIconComponent, MockPipe(TranslatePipe)],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoIconComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept tooltipText input', () => {
    componentRef.setInput('tooltipText', 'This is a tooltip');
    fixture.detectChanges();

    expect(component.tooltipText()).toBe('This is a tooltip');
  });
});
