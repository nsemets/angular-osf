import { createDispatchMap, select } from '@ngxs/store';

import { TranslateModule } from '@ngx-translate/core';

import { TabsModule } from 'primeng/tabs';

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { LoadingSpinnerComponent } from '@shared/components';
import { FetchInstitutionById, InstitutionsSearchSelectors } from '@shared/stores';

interface TabOption {
  label: string;
  value: string;
  route: string;
}

@Component({
  selector: 'osf-admin-institutions',
  imports: [TabsModule, TranslateModule, RouterOutlet, NgOptimizedImage, LoadingSpinnerComponent],
  templateUrl: './admin-institutions.component.html',
  styleUrl: './admin-institutions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInstitutionsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  institution = select(InstitutionsSearchSelectors.getInstitution);
  isInstitutionLoading = select(InstitutionsSearchSelectors.getInstitutionLoading);

  private readonly actions = createDispatchMap({
    fetchInstitution: FetchInstitutionById,
  });

  selectedTab = 'summary';

  resourceTabOptions: TabOption[] = [
    { label: 'Summary', value: 'summary', route: 'summary' },
    { label: 'Users', value: 'users', route: 'users' },
    { label: 'Projects', value: 'projects', route: 'projects' },
    { label: 'Registrations', value: 'registrations', route: 'registrations' },
    { label: 'Preprints', value: 'preprints', route: 'preprints' },
  ];

  ngOnInit() {
    const institutionId = this.route.snapshot.params['institution-id'];

    if (institutionId) {
      this.actions.fetchInstitution(institutionId);
    }

    this.selectedTab = this.route.snapshot.firstChild?.routeConfig?.path || 'summary';
  }

  onTabChange(selectedValue: string | number) {
    const value = String(selectedValue);
    this.selectedTab = value;
    const selectedTab = this.resourceTabOptions.find((tab) => tab.value === value);
    if (selectedTab) {
      this.router.navigate([selectedTab.route], { relativeTo: this.route });
    }
  }
}
