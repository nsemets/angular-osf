import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsEmailNotificationsComponent } from './settings-email-notifications.component';

describe('SettingsEmailNotificationsComponent', () => {
  let component: SettingsEmailNotificationsComponent;
  let fixture: ComponentFixture<SettingsEmailNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsEmailNotificationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsEmailNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
