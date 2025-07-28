import { createDispatchMap, select } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { LoadingSpinnerComponent, SubHeaderComponent } from '@shared/components';

import { GetLinkedNodes, GetLinkedRegistrations, RegistryLinksSelectors } from '../../store/registry-links';

@Component({
  selector: 'osf-registry-links',
  imports: [SubHeaderComponent, TranslatePipe, LoadingSpinnerComponent, Card, Button, Tag],
  templateUrl: './registry-links.component.html',
  styleUrl: './registry-links.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistryLinksComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  private registryId = signal('');

  protected actions = createDispatchMap({
    getLinkedNodes: GetLinkedNodes,
    getLinkedRegistrations: GetLinkedRegistrations,
  });

  protected linkedNodes = select(RegistryLinksSelectors.getLinkedNodes);
  protected linkedNodesLoading = select(RegistryLinksSelectors.getLinkedNodesLoading);
  protected linkedNodesMeta = select(RegistryLinksSelectors.getLinkedNodesMeta);

  protected linkedRegistrations = select(RegistryLinksSelectors.getLinkedRegistrations);
  protected linkedRegistrationsLoading = select(RegistryLinksSelectors.getLinkedRegistrationsLoading);
  protected linkedRegistrationsMeta = select(RegistryLinksSelectors.getLinkedRegistrationsMeta);

  ngOnInit(): void {
    this.registryId.set(this.route.parent?.parent?.snapshot.params['id']);

    if (this.registryId()) {
      this.actions.getLinkedNodes(this.registryId());
      this.actions.getLinkedRegistrations(this.registryId());
    }
  }

  onViewProject(htmlUrl: string): void {
    window.open(htmlUrl, '_blank');
  }

  onViewRegistration(htmlUrl: string): void {
    window.open(htmlUrl, '_blank');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getContributorText(count?: number): string {
    if (!count) return '';
    return count === 1 ? '1 contributor' : `${count} contributors`;
  }
}
