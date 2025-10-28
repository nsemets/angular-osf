import { MockComponents, MockProvider } from 'ng-mocks';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { PreprintProviderDetails } from '@osf/features/preprints/models';
import { PreprintSelectors } from '@osf/features/preprints/store/preprint';
import {
  AffiliatedInstitutionsViewComponent,
  ContributorsListComponent,
  IconComponent,
  TruncatedTextComponent,
} from '@shared/components';
import { ContributorsSelectors } from '@shared/stores/contributors';
import { InstitutionsSelectors } from '@shared/stores/institutions';

import { PreprintDoiSectionComponent } from '../preprint-doi-section/preprint-doi-section.component';

import { GeneralInformationComponent } from './general-information.component';

import { MOCK_CONTRIBUTOR, MOCK_INSTITUTION } from '@testing/mocks';
import { PREPRINT_MOCK } from '@testing/mocks/preprint.mock';
import { PREPRINT_PROVIDER_DETAILS_MOCK } from '@testing/mocks/preprint-provider-details';
import { OSFTestingModule } from '@testing/osf.testing.module';
import { provideMockStore } from '@testing/providers/store-provider.mock';

describe('GeneralInformationComponent', () => {
  let component: GeneralInformationComponent;
  let fixture: ComponentFixture<GeneralInformationComponent>;

  const mockPreprint = PREPRINT_MOCK;
  const mockContributors = [MOCK_CONTRIBUTOR];
  const mockInstitutions = [MOCK_INSTITUTION];
  const mockPreprintProvider: PreprintProviderDetails = PREPRINT_PROVIDER_DETAILS_MOCK;
  const mockWebUrl = 'https://staging4.osf.io';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GeneralInformationComponent,
        OSFTestingModule,
        ...MockComponents(
          TruncatedTextComponent,
          PreprintDoiSectionComponent,
          IconComponent,
          AffiliatedInstitutionsViewComponent,
          ContributorsListComponent
        ),
      ],
      providers: [
        MockProvider(ENVIRONMENT, { webUrl: mockWebUrl }),
        provideMockStore({
          signals: [
            {
              selector: PreprintSelectors.getPreprint,
              value: mockPreprint,
            },
            {
              selector: PreprintSelectors.isPreprintLoading,
              value: false,
            },
            {
              selector: ContributorsSelectors.getBibliographicContributors,
              value: mockContributors,
            },
            {
              selector: ContributorsSelectors.isBibliographicContributorsLoading,
              value: false,
            },
            {
              selector: ContributorsSelectors.hasMoreBibliographicContributors,
              value: false,
            },
            {
              selector: InstitutionsSelectors.getResourceInstitutions,
              value: mockInstitutions,
            },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralInformationComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('preprintProvider', mockPreprintProvider);
  });

  it('should return preprint from store', () => {
    const preprint = component.preprint();
    expect(preprint).toBe(mockPreprint);
  });

  it('should return contributors from store', () => {
    const contributors = component.bibliographicContributors();
    expect(contributors).toBe(mockContributors);
  });

  it('should return affiliated institutions from store', () => {
    const institutions = component.affiliatedInstitutions();
    expect(institutions).toBe(mockInstitutions);
  });

  it('should compute node link from preprint', () => {
    const nodeLink = component.nodeLink();
    expect(nodeLink).toBe(`${mockWebUrl}/node-123`);
  });

  it('should have skeleton data array with 5 null elements', () => {
    expect(component.skeletonData).toHaveLength(5);
    expect(component.skeletonData.every((item) => item === null)).toBe(true);
  });

  it('should have preprint provider input', () => {
    expect(component.preprintProvider()).toBe(mockPreprintProvider);
  });
});
