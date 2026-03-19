import { MockComponent } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavMenuComponent } from '../nav-menu/nav-menu.component';

import { SidenavComponent } from './sidenav.component';

import { provideOSFCore } from '@testing/osf.testing.provider';

describe('SidenavComponent', () => {
  let component: SidenavComponent;
  let fixture: ComponentFixture<SidenavComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SidenavComponent, MockComponent(NavMenuComponent)],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(SidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
