import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisconnectAddonModalComponent } from './disconnect-addon-modal.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe.skip('DisconnectAddonModalComponent', () => {
  let component: DisconnectAddonModalComponent;
  let fixture: ComponentFixture<DisconnectAddonModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisconnectAddonModalComponent],
      providers: [provideOSFCore()],
    }).compileComponents();

    fixture = TestBed.createComponent(DisconnectAddonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
