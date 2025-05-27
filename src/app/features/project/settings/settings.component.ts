import { createDispatchMap, select, Store } from '@ngxs/store';

import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TabPanels } from 'primeng/tabs';

import { map, of } from 'rxjs';

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { UpdateNodeRequestModel } from '@osf/features/my-projects/entities/update-node-request.model';
import {
  ProjectDetailSettingAccordionComponent,
  SettingsAccessRequestsCardComponent,
  SettingsCommentingCardComponent,
  SettingsProjectFormCardComponent,
  SettingsStorageLocationCardComponent,
  SettingsViewOnlyLinksCardComponent,
  SettingsWikiCardComponent,
} from '@osf/features/project/settings/components';
import { SettingsRedirectLinkComponent } from '@osf/features/project/settings/components/settings-redirect-link/settings-redirect-link.component';
import { mockSettingsData } from '@osf/features/project/settings/mock-data';
import { LinkTableModel, ProjectSettingsAttributes, ProjectSettingsData } from '@osf/features/project/settings/models';
import { RightControl } from '@osf/features/project/settings/models/right-control.model';
import {
  GetProjectDetails,
  GetProjectSettings,
  SettingsSelectors,
  UpdateProjectDetails,
  UpdateProjectSettings,
} from '@osf/features/project/settings/store';
import {
  GetNotificationSubscriptionsByNodeId,
  NotificationSubscriptionSelectors,
} from '@osf/features/settings/notifications/store';
import { SubHeaderComponent } from '@shared/components/sub-header/sub-header.component';
import { ProjectForm } from '@shared/entities/create-project-form.interface';
import { ProjectFormControls } from '@shared/entities/create-project-form-controls.enum';
import { IS_WEB } from '@shared/utils/breakpoints.tokens';

@Component({
  selector: 'osf-settings',
  imports: [
    TranslatePipe,
    SubHeaderComponent,
    TabPanels,
    FormsModule,
    ReactiveFormsModule,
    Card,
    Button,
    ProjectDetailSettingAccordionComponent,
    NgOptimizedImage,
    SettingsProjectFormCardComponent,
    SettingsStorageLocationCardComponent,
    SettingsViewOnlyLinksCardComponent,
    SettingsAccessRequestsCardComponent,
    SettingsWikiCardComponent,
    SettingsCommentingCardComponent,
    SettingsRedirectLinkComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SettingsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);

  readonly projectId = toSignal(this.route.parent?.params.pipe(map((params) => params['id'])) ?? of(undefined));

  protected settings = select(SettingsSelectors.getSettings);
  protected notifications = select(NotificationSubscriptionSelectors.getNotificationSubscriptionsByNodeId);
  protected projectDetails = select(SettingsSelectors.getProjectDetails);

  protected actions = createDispatchMap({
    getSettings: GetProjectSettings,
    getNotifications: GetNotificationSubscriptionsByNodeId,
    getProjectDetails: GetProjectDetails,
  });

  protected readonly isDesktop = toSignal(inject(IS_WEB));

  projectForm = new FormGroup<Partial<ProjectForm>>({
    [ProjectFormControls.Title]: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    [ProjectFormControls.Description]: new FormControl('', {
      nonNullable: true,
    }),
  });

  redirectUrlData = signal<{ url: string; label: string }>({ url: '', label: '' });
  accessRequest = signal<boolean>(false);
  wikiEnabled = signal<boolean>(false);
  anyoneCanEditWiki = signal<boolean>(false);
  redirectLink = signal<boolean>(false);
  anyoneCanComment = signal<boolean>(false);

  tableData: LinkTableModel[];
  access: string;
  accessOptions: { label: string; value: string }[];
  commentSetting: string;
  fileSetting: string;
  dropdownOptions: { label: string; value: string }[];
  affiliations: { name: string; canDelete: boolean }[];
  rightControls: { notifications: RightControl[] } = { notifications: [] };

  constructor() {
    [
      this.tableData,
      this.access,
      this.accessOptions,
      this.commentSetting,
      this.fileSetting,
      this.dropdownOptions,
      this.affiliations,
    ] = [
      mockSettingsData.tableData,
      mockSettingsData.access,
      mockSettingsData.accessOptions,
      mockSettingsData.commentSetting,
      mockSettingsData.fileSetting,
      mockSettingsData.dropdownOptions,
      mockSettingsData.affiliations,
    ];

    effect(() => {
      const settings = this.settings();
      if (Object.keys(settings).length) {
        this.accessRequest.set(settings.attributes.accessRequestsEnabled);
        this.wikiEnabled.set(settings.attributes.wikiEnabled);
        this.anyoneCanEditWiki.set(settings.attributes.anyoneCanEditWiki);
        this.anyoneCanComment.set(settings.attributes.anyoneCanComment);
        this.redirectUrlData.set({
          url: settings.attributes.redirectLinkUrl,
          label: settings.attributes.redirectLinkLabel,
        });
      }
    });

    effect(() => {
      const notifications = this.notifications();
      console.log(notifications);
    });

    effect(() => {
      const projectDetails = this.projectDetails();
      if (Object.keys(projectDetails).length) {
        this.projectForm.patchValue({
          [ProjectFormControls.Title]: projectDetails.attributes.title,
          [ProjectFormControls.Description]: projectDetails.attributes.description,
        });
      }
    });
  }

  ngOnInit(): void {
    if (this.projectId()) {
      this.actions.getSettings(this.projectId());
      this.actions.getNotifications(this.projectId());
      this.actions.getProjectDetails(this.projectId());
    }
  }

  onAccessRequestChange(newValue: boolean): void {
    this.accessRequest.set(newValue);
    this.syncSettingsChanges('accessRequest', newValue);
  }

  onWikiRequestChange(newValue: boolean): void {
    this.wikiEnabled.set(newValue);
    this.syncSettingsChanges('wikiEnabled', newValue);
  }

  onAnyoneCanEditWikiRequestChange(newValue: boolean): void {
    this.anyoneCanEditWiki.set(newValue);
    this.syncSettingsChanges('anyoneCanEditWiki', newValue);
  }

  onAnyoneCanCommentRequestChange(newValue: boolean): void {
    this.anyoneCanComment.set(newValue);
    this.syncSettingsChanges('anyoneCanComment', newValue);
  }

  onRedirectUrlDataRequestChange(data: { url: string; label: string }): void {
    this.redirectUrlData.set(data);
    this.syncSettingsChanges('redirectUrl', data);
  }

  submitForm(value: { title: string; description: string }): void {
    const { title, description } = value;
    const current = this.projectDetails().attributes;

    const isTitleUnchanged = title === current.title;
    const isDescriptionUnchanged = description === current.description;

    if (isTitleUnchanged && isDescriptionUnchanged) {
      return;
    }

    const model: UpdateNodeRequestModel = {
      data: {
        type: 'nodes',
        id: this.projectId(),
        attributes: {
          title,
          description,
        },
      },
    } as UpdateNodeRequestModel;

    this.store.dispatch(new UpdateProjectDetails(model)).subscribe();
  }

  deleteLinkItem(item: LinkTableModel): void {
    console.log(item);
  }

  deleteProject(): void {
    this.projectForm.reset();
  }

  private syncSettingsChanges(changedField: string, value: boolean | { url: string; label: string }): void {
    const payload: Partial<ProjectSettingsAttributes> = {};

    switch (changedField) {
      case 'accessRequest':
        payload['access_requests_enabled'] = value as boolean;
        break;
      case 'wikiEnabled':
        payload['wiki_enabled'] = value as boolean;
        break;
      case 'redirectLink':
        payload['redirect_link_enabled'] = value as boolean;
        break;
      case 'anyoneCanEditWiki':
        payload['anyone_can_edit_wiki'] = value as boolean;
        break;
      case 'anyoneCanComment':
        payload['anyone_can_comment'] = value as boolean;
        break;
      case 'redirectUrl':
        if (typeof value === 'object') {
          payload['redirect_link_enabled'] = true;
          payload['redirect_link_url'] = value.url ?? null;
          payload['redirect_link_label'] = value.label ?? null;
        }
        break;
    }

    const model = {
      id: this.projectId(),
      type: 'node-settings',
      attributes: { ...payload },
    } as ProjectSettingsData;

    this.store.dispatch(new UpdateProjectSettings(model)).subscribe();
  }
}
