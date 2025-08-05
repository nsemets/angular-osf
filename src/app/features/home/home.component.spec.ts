import { provideStore } from '@ngxs/store';

import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MockComponents, MockPipe } from 'ng-mocks';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MyProjectsTableComponent, SubHeaderComponent } from '@shared/components';
import { MyResourcesState } from '@shared/stores/my-resources/my-resources.state';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        TranslateModule.forRoot(),
        ...MockComponents(SubHeaderComponent, MyProjectsTableComponent),
        MockPipe(TranslatePipe),
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        provideStore([MyResourcesState]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
