import { Store } from '@ngxs/store';

import { MockComponents, MockProviders } from 'ng-mocks';

import { signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ScheduledBannerComponent } from '@core/components/osf-banners/scheduled-banner/scheduled-banner.component';
import { IconComponent } from '@osf/shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { MyProjectsTableComponent } from '@osf/shared/components/my-projects-table/my-projects-table.component';
import { SearchInputComponent } from '@osf/shared/components/search-input/search-input.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ProjectRedirectDialogService } from '@osf/shared/services/project-redirect-dialog.service';
import { MyResourcesSelectors } from '@shared/stores/my-resources';

import { DashboardComponent } from './dashboard.component';

import { getProjectsMockForComponent } from '@testing/data/dashboard/dasboard.data';
import { OSFTestingStoreModule } from '@testing/osf.testing.module';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  let projectsSignal: WritableSignal<any[]>;
  let totalProjectsSignal: WritableSignal<number>;
  let areProjectsLoadingSignal: WritableSignal<boolean>;

  beforeEach(async () => {
    projectsSignal = signal(getProjectsMockForComponent());
    totalProjectsSignal = signal(getProjectsMockForComponent().length);
    areProjectsLoadingSignal = signal(false);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        OSFTestingStoreModule,
        ...MockComponents(
          SubHeaderComponent,
          MyProjectsTableComponent,
          SearchInputComponent,
          IconComponent,
          LoadingSpinnerComponent,
          ScheduledBannerComponent
        ),
      ],
      providers: [
        {
          provide: Store,
          useValue: {
            selectSignal: (selector: any) => {
              if (selector === MyResourcesSelectors.getProjects) return projectsSignal;
              if (selector === MyResourcesSelectors.getTotalProjects) return totalProjectsSignal;
              if (selector === MyResourcesSelectors.getProjectsLoading) return areProjectsLoadingSignal;
              return signal(null);
            },
            dispatch: jest.fn(),
          },
        },
        MockProviders(CustomDialogService, CustomConfirmationService, ProjectRedirectDialogService),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should show loading spinner when projects are loading', () => {
    areProjectsLoadingSignal.set(true);
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.directive(LoadingSpinnerComponent));
    expect(spinner).toBeTruthy();
  });

  it('should render projects table when projects exist', () => {
    projectsSignal.set(getProjectsMockForComponent());
    totalProjectsSignal.set(getProjectsMockForComponent().length);
    areProjectsLoadingSignal.set(false);
    fixture.detectChanges();

    const table = fixture.debugElement.query(By.directive(MyProjectsTableComponent));
    expect(table).toBeTruthy();
  });

  it('should render welcome video when no projects exist', () => {
    projectsSignal.set([]);
    totalProjectsSignal.set(0);
    areProjectsLoadingSignal.set(false);
    fixture.detectChanges();
    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe).toBeTruthy();
    expect(iframe.nativeElement.src).toContain('youtube.com');
  });

  it('should render welcome screen when no projects exist', () => {
    projectsSignal.set([]);
    totalProjectsSignal.set(0);
    areProjectsLoadingSignal.set(false);
    fixture.detectChanges();

    const welcomeText = fixture.debugElement.nativeElement.textContent;
    expect(welcomeText).toContain('home.loggedIn.dashboard.noCreatedProject');
  });

  it('should open OSF help link in new tab when openInfoLink is called', () => {
    const spy = jest.spyOn(window, 'open').mockImplementation(() => null);
    component.openInfoLink();
    expect(spy).toHaveBeenCalledWith('https://help.osf.io/', '_blank');
  });

  it('should render product images after loading spinner disappears', () => {
    areProjectsLoadingSignal.set(true);
    fixture.detectChanges();

    let productImages = fixture.debugElement
      .queryAll(By.css('img'))
      .filter((img) => img.nativeElement.getAttribute('src')?.includes('assets/images/dashboard/products/'));

    expect(productImages.length).toBe(0);

    const spinner = fixture.debugElement.query(By.css('osf-loading-spinner'));
    expect(spinner).toBeTruthy();

    areProjectsLoadingSignal.set(false);
    fixture.detectChanges();

    productImages = fixture.debugElement
      .queryAll(By.css('img'))
      .filter((img) => img.nativeElement.getAttribute('src')?.includes('assets/images/dashboard/products/'));

    expect(productImages.length).toBe(4);

    const sources = productImages.map((img) => img.nativeElement.getAttribute('src'));

    expect(sources).toEqual(
      expect.arrayContaining([
        'assets/images/dashboard/products/osf-collections.png',
        'assets/images/dashboard/products/osf-institutions.png',
        'assets/images/dashboard/products/osf-registries.png',
        'assets/images/dashboard/products/osf-preprints.png',
      ])
    );
  });
});
