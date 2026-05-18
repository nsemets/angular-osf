import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { Mock } from 'vitest';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { LoadingSpinnerComponent } from '@osf/shared/components/loading-spinner/loading-spinner.component';
import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { SubscriptionEvent } from '@osf/shared/enums/subscriptions/subscription-event.enum';
import { SubscriptionFrequency } from '@osf/shared/enums/subscriptions/subscription-frequency.enum';
import { Institution } from '@osf/shared/models/institutions/institutions.model';
import { CustomConfirmationService } from '@osf/shared/services/custom-confirmation.service';
import { CustomDialogService } from '@osf/shared/services/custom-dialog.service';
import { ToastService } from '@osf/shared/services/toast.service';
import { GetResource, GetResourceWithChildren } from '@osf/shared/stores/current-resource';
import { DeleteViewOnlyLink, FetchViewOnlyLinks, ViewOnlyLinkSelectors } from '@osf/shared/stores/view-only-links';
import { DeleteConfirmationOptions } from '@shared/models/confirmation-options.model';

import { MOCK_INSTITUTION } from '@testing/mocks/institution.mock';
import { MOCK_NODE_DETAILS } from '@testing/mocks/node-details.mock';
import { MOCK_PROJECT_SETTINGS } from '@testing/mocks/project-settings.mock';
import { MOCK_VIEW_ONLY_LINK } from '@testing/mocks/view-only-link.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import {
  CustomConfirmationServiceMock,
  CustomConfirmationServiceMockType,
} from '@testing/providers/custom-confirmation-provider.mock';
import { CustomDialogServiceMock, CustomDialogServiceMockType } from '@testing/providers/custom-dialog-provider.mock';
import {
  LoaderServiceMock,
  LoaderServiceMockType,
  provideLoaderServiceMock,
} from '@testing/providers/loader-service.mock';
import { ActivatedRouteMockBuilder } from '@testing/providers/route-provider.mock';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';
import { ToastServiceMock, ToastServiceMockType } from '@testing/providers/toast-provider.mock';

import {
  DeleteProjectDialogComponent,
  ProjectSettingNotificationsComponent,
  SettingsAccessRequestsCardComponent,
  SettingsProjectAffiliationComponent,
  SettingsProjectFormCardComponent,
  SettingsStorageLocationCardComponent,
  SettingsViewOnlyLinksCardComponent,
  SettingsWikiCardComponent,
} from './components';
import { NodeDetailsModel, ProjectSettingsDataJsonApi } from './models';
import { SettingsComponent } from './settings.component';
import {
  DeleteInstitution,
  GetProjectDetails,
  GetProjectNotificationSubscriptions,
  GetProjectSettings,
  SettingsSelectors,
  UpdateProjectDetails,
  UpdateProjectNotificationSubscription,
  UpdateProjectSettings,
} from './store';

describe('SettingsComponent', () => {
  const mockProjectId = 'test-project-123';

  const mockProjectDetails: NodeDetailsModel = {
    ...MOCK_NODE_DETAILS,
    id: mockProjectId,
    title: 'Test Project',
    description: 'Test Description',
  };

  const defaultSignals: SignalOverride[] = [
    { selector: SettingsSelectors.getSettings, value: MOCK_PROJECT_SETTINGS },
    { selector: SettingsSelectors.getNotificationSubscriptions, value: [] },
    { selector: SettingsSelectors.areNotificationsLoading, value: false },
    { selector: SettingsSelectors.getProjectDetails, value: mockProjectDetails },
    { selector: SettingsSelectors.areProjectDetailsLoading, value: false },
    { selector: SettingsSelectors.hasAdminAccess, value: true },
    { selector: SettingsSelectors.hasWriteAccess, value: true },
    { selector: ViewOnlyLinkSelectors.getViewOnlyLinks, value: [] },
    { selector: ViewOnlyLinkSelectors.isViewOnlyLinksLoading, value: false },
  ];

  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let store: Store;
  let customConfirmationService: CustomConfirmationServiceMockType;
  let customDialogService: CustomDialogServiceMockType;
  let loaderService: LoaderServiceMockType;
  let toastService: ToastServiceMockType;

  async function setup(overrides: BaseSetupOverrides = {}): Promise<void> {
    const routeBuilder = ActivatedRouteMockBuilder.create().withParams(overrides.routeParams ?? { id: mockProjectId });
    if (overrides.hasParent === false) {
      routeBuilder.withNoParent();
    }

    customConfirmationService = CustomConfirmationServiceMock.simple();
    customDialogService = CustomDialogServiceMock.simple();
    loaderService = new LoaderServiceMock();
    toastService = ToastServiceMock.simple();

    const signals = mergeSignalOverrides(defaultSignals, overrides.selectorOverrides);

    TestBed.configureTestingModule({
      imports: [
        SettingsComponent,
        ...MockComponents(
          SubHeaderComponent,
          SettingsProjectFormCardComponent,
          SettingsStorageLocationCardComponent,
          SettingsViewOnlyLinksCardComponent,
          SettingsAccessRequestsCardComponent,
          SettingsWikiCardComponent,
          SettingsProjectAffiliationComponent,
          ProjectSettingNotificationsComponent,
          LoadingSpinnerComponent
        ),
      ],
      providers: [
        provideOSFCore(),
        MockProvider(ActivatedRoute, routeBuilder.build()),
        MockProvider(CustomConfirmationService, customConfirmationService),
        MockProvider(CustomDialogService, customDialogService),
        provideLoaderServiceMock(loaderService),
        MockProvider(ToastService, toastService),
        provideMockStore({ signals }),
      ],
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function clearDispatch(): void {
    (store.dispatch as Mock).mockClear();
  }

  function confirmLastDelete(): void {
    const options = customConfirmationService.confirmDelete.mock.calls[0][0] as DeleteConfirmationOptions;
    options.onConfirm();
  }

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should read project id from parent route params', async () => {
    await setup();
    expect(component.projectId()).toBe(mockProjectId);
  });

  it('should dispatch initial data actions on init when project id exists', async () => {
    await setup();

    expect(store.dispatch).toHaveBeenCalledWith(new GetProjectSettings(mockProjectId));
    expect(store.dispatch).toHaveBeenCalledWith(new GetProjectNotificationSubscriptions(mockProjectId));
    expect(store.dispatch).toHaveBeenCalledWith(new GetProjectDetails(mockProjectId));
  });

  it('should not dispatch initial data actions when project id is missing', async () => {
    await setup({ hasParent: false });
    clearDispatch();

    component.ngOnInit();

    expect(store.dispatch).not.toHaveBeenCalledWith(expect.any(GetProjectSettings));
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.any(GetProjectNotificationSubscriptions));
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.any(GetProjectDetails));
  });

  it('should sync setting toggles from store settings', async () => {
    await setup();

    expect(component.accessRequest()).toBe(true);
    expect(component.wikiEnabled()).toBe(false);
    expect(component.anyoneCanEditWiki()).toBe(false);
  });

  it('should fetch view only links when user has admin access', async () => {
    await setup();

    expect(store.dispatch).toHaveBeenCalledWith(new FetchViewOnlyLinks(mockProjectId, ResourceType.Project));
  });

  it('should not fetch view only links without admin access', async () => {
    await setup({ selectorOverrides: [{ selector: SettingsSelectors.hasAdminAccess, value: false }] });

    expect(store.dispatch).not.toHaveBeenCalledWith(new FetchViewOnlyLinks(mockProjectId, ResourceType.Project));
  });

  it('should update access request and dispatch settings update', async () => {
    await setup();
    clearDispatch();

    component.onAccessRequestChange(true);

    expect(component.accessRequest()).toBe(true);
    expect(loaderService.show).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(
      new UpdateProjectSettings({
        id: mockProjectId,
        type: 'node-settings',
        attributes: { access_requests_enabled: true },
      } as ProjectSettingsDataJsonApi)
    );
    expect(toastService.showSuccess).toHaveBeenCalledWith('myProjects.settings.updateProjectSettingsMessage');
    expect(loaderService.hide).toHaveBeenCalled();
  });

  it('should update wiki setting, dispatch settings update, and refresh resource', async () => {
    await setup();
    clearDispatch();

    component.onWikiRequestChange(true);

    expect(component.wikiEnabled()).toBe(true);
    expect(store.dispatch).toHaveBeenCalledWith(
      new UpdateProjectSettings({
        id: mockProjectId,
        type: 'node-settings',
        attributes: { wiki_enabled: true },
      } as ProjectSettingsDataJsonApi)
    );
    expect(store.dispatch).toHaveBeenCalledWith(new GetResource(mockProjectId, true));
  });

  it('should update anyone can edit wiki setting and dispatch settings update', async () => {
    await setup();
    clearDispatch();

    component.onAnyoneCanEditWikiRequestChange(true);

    expect(component.anyoneCanEditWiki()).toBe(true);
    expect(store.dispatch).toHaveBeenCalledWith(
      new UpdateProjectSettings({
        id: mockProjectId,
        type: 'node-settings',
        attributes: { anyone_can_edit_wiki: true },
      } as ProjectSettingsDataJsonApi)
    );
  });

  it('should update notification subscription on notification change', async () => {
    await setup();
    clearDispatch();

    component.onNotificationRequestChange({
      event: SubscriptionEvent.FileUpdated,
      frequency: SubscriptionFrequency.Daily,
    });

    expect(loaderService.show).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(
      new UpdateProjectNotificationSubscription({
        id: `${mockProjectId}_${SubscriptionEvent.FileUpdated}`,
        frequency: SubscriptionFrequency.Daily,
      })
    );
    expect(toastService.showSuccess).toHaveBeenCalledWith('myProjects.settings.updateProjectSettingsMessage');
    expect(loaderService.hide).toHaveBeenCalled();
  });

  it('should dispatch project details update when form values change', async () => {
    await setup();
    clearDispatch();

    component.submitForm({ title: 'New Title', description: 'New Description' });

    expect(loaderService.show).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(
      new UpdateProjectDetails({
        data: {
          type: 'nodes',
          id: mockProjectId,
          attributes: { title: 'New Title', description: 'New Description' },
        },
      })
    );
    expect(toastService.showSuccess).toHaveBeenCalledWith('myProjects.settings.updateProjectDetailsMessage');
    expect(loaderService.hide).toHaveBeenCalled();
  });

  it('should not dispatch project details update when form values are unchanged', async () => {
    await setup();
    clearDispatch();
    loaderService.show.mockClear();

    component.submitForm({ title: 'Test Project', description: 'Test Description' });

    expect(loaderService.show).not.toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalledWith(expect.any(UpdateProjectDetails));
  });

  it('should confirm and delete view only link on confirm', async () => {
    await setup();
    clearDispatch();

    component.deleteLinkItem(MOCK_VIEW_ONLY_LINK);

    expect(customConfirmationService.confirmDelete).toHaveBeenCalledWith({
      headerKey: 'myProjects.settings.delete.title',
      headerParams: { name: MOCK_VIEW_ONLY_LINK.name },
      messageKey: 'myProjects.settings.delete.message',
      onConfirm: expect.any(Function),
    });

    confirmLastDelete();

    expect(store.dispatch).toHaveBeenCalledWith(
      new DeleteViewOnlyLink(mockProjectId, ResourceType.Project, MOCK_VIEW_ONLY_LINK.id)
    );
    expect(toastService.showSuccess).toHaveBeenCalledWith('myProjects.settings.viewOnlyLinkDeleted');
    expect(loaderService.hide).toHaveBeenCalled();
  });

  it('should load components tree and open delete project dialog', async () => {
    await setup();
    clearDispatch();

    component.deleteProject();

    expect(loaderService.show).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(
      new GetResourceWithChildren(mockProjectId, mockProjectId, ResourceType.Project)
    );
    expect(loaderService.hide).toHaveBeenCalled();
    expect(customDialogService.open).toHaveBeenCalledWith(DeleteProjectDialogComponent, {
      header: 'project.deleteProject.dialog.deleteProject',
      width: '500px',
    });
  });

  it('should use root id when loading components tree for delete project', async () => {
    const rootId = 'root-project-id';
    await setup({
      selectorOverrides: [{ selector: SettingsSelectors.getProjectDetails, value: { ...mockProjectDetails, rootId } }],
    });
    clearDispatch();

    component.deleteProject();

    expect(store.dispatch).toHaveBeenCalledWith(
      new GetResourceWithChildren(rootId, mockProjectId, ResourceType.Project)
    );
  });

  it('should confirm and remove affiliation on confirm', async () => {
    const affiliation = MOCK_INSTITUTION as Institution;
    await setup();
    clearDispatch();

    component.removeAffiliation(affiliation);

    expect(customConfirmationService.confirmDelete).toHaveBeenCalledWith({
      headerKey: 'project.deleteInstitution.title',
      messageParams: { name: affiliation.name },
      messageKey: 'project.deleteInstitution.message',
      onConfirm: expect.any(Function),
    });

    confirmLastDelete();

    expect(loaderService.show).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(new DeleteInstitution(affiliation.id, mockProjectId));
    expect(loaderService.hide).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalledWith('project.deleteInstitution.success');
    expect(store.dispatch).toHaveBeenCalledWith(new GetProjectDetails(mockProjectId));
  });
});
