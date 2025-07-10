import { select } from '@ngxs/store';

import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';

import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { SearchSelectors } from '../../store';
import {
  CreatorsFilterComponent,
  DateCreatedFilterComponent,
  FunderFilterComponent,
  InstitutionFilterComponent,
  LicenseFilterComponent,
  PartOfCollectionFilterComponent,
  ProviderFilterComponent,
  ResourceTypeFilterComponent,
  SubjectFilterComponent,
} from '../filters';
import { ResourceFiltersOptionsSelectors } from '../filters/store';

@Component({
  selector: 'osf-resource-filters',
  imports: [
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionPanel,
    ReactiveFormsModule,
    CreatorsFilterComponent,
    DateCreatedFilterComponent,
    SubjectFilterComponent,
    FunderFilterComponent,
    LicenseFilterComponent,
    ResourceTypeFilterComponent,
    ProviderFilterComponent,
    PartOfCollectionFilterComponent,
    InstitutionFilterComponent,
  ],
  templateUrl: './resource-filters.component.html',
  styleUrl: './resource-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceFiltersComponent {
  readonly datesOptionsCount = computed(() => {
    return select(ResourceFiltersOptionsSelectors.getDatesCreated)().reduce(
      (accumulator, date) => accumulator + date.count,
      0
    );
  });

  readonly funderOptionsCount = computed(() =>
    select(ResourceFiltersOptionsSelectors.getFunders)().reduce((acc, item) => acc + item.count, 0)
  );

  readonly subjectOptionsCount = computed(() =>
    select(ResourceFiltersOptionsSelectors.getSubjects)().reduce((acc, item) => acc + item.count, 0)
  );

  readonly licenseOptionsCount = computed(() =>
    select(ResourceFiltersOptionsSelectors.getLicenses)().reduce((acc, item) => acc + item.count, 0)
  );

  readonly resourceTypeOptionsCount = computed(() =>
    select(ResourceFiltersOptionsSelectors.getResourceTypes)().reduce((acc, item) => acc + item.count, 0)
  );

  readonly institutionOptionsCount = computed(() =>
    select(ResourceFiltersOptionsSelectors.getInstitutions)().reduce((acc, item) => acc + item.count, 0)
  );

  readonly providerOptionsCount = computed(() =>
    select(ResourceFiltersOptionsSelectors.getProviders)().reduce((acc, item) => acc + item.count, 0)
  );

  readonly partOfCollectionOptionsCount = computed(() =>
    select(ResourceFiltersOptionsSelectors.getPartOfCollection)().reduce((acc, item) => acc + item.count, 0)
  );

  readonly isMyProfilePage = select(SearchSelectors.getIsMyProfile);

  readonly anyOptionsCount = computed(() => {
    return (
      this.datesOptionsCount() > 0 ||
      this.funderOptionsCount() > 0 ||
      this.subjectOptionsCount() > 0 ||
      this.licenseOptionsCount() > 0 ||
      this.resourceTypeOptionsCount() > 0 ||
      this.institutionOptionsCount() > 0 ||
      this.providerOptionsCount() > 0 ||
      this.partOfCollectionOptionsCount() > 0 ||
      !this.isMyProfilePage()
    );
  });
}
