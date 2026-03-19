import { MockComponent } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoIconComponent } from '../info-icon/info-icon.component';

import { ComponentCheckboxItemComponent } from './component-checkbox-item.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('ComponentCheckboxItemComponent', () => {
  let component: ComponentCheckboxItemComponent;
  let fixture: ComponentFixture<ComponentCheckboxItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentCheckboxItemComponent, MockComponent(InfoIconComponent)],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(ComponentCheckboxItemComponent);
    fixture.componentRef.setInput('item', { id: '1', name: 'Test Item', checked: false });
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
