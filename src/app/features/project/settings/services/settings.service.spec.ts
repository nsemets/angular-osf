import { HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { SubscriptionEvent } from '@osf/shared/enums/subscriptions/subscription-event.enum';
import { SubscriptionFrequency } from '@osf/shared/enums/subscriptions/subscription-frequency.enum';
import { SubscriptionType } from '@osf/shared/enums/subscriptions/subscription-type.enum';
import { NodeShortInfoModel } from '@osf/shared/models/nodes/node-with-children.model';
import { UpdateNodeRequestModel } from '@osf/shared/models/nodes/nodes-json-api.model';
import { NotificationSubscription } from '@osf/shared/models/notifications/notification-subscription.model';

import {
  MOCK_NODE_DATA_JSON_API,
  MOCK_NOTIFICATION_SUBSCRIPTION_API,
  MOCK_PROJECT_ID,
  MOCK_PROJECT_SETTINGS_API_RESPONSE,
  MOCK_PROJECT_SETTINGS_PATCH_DATA,
} from '@testing/mocks/project-settings-api.mock';
import { provideOSFCore, provideOSFHttp } from '@testing/osf.testing.provider';
import { EnvironmentTokenMock } from '@testing/providers/environment.token.mock';

import { NodeDetailsModel, ProjectSettingsModel } from '../models';

import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  const apiBase = `${EnvironmentTokenMock.useValue.apiDomainUrl}/v2`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideOSFCore(), provideOSFHttp(), SettingsService],
    });
    service = TestBed.inject(SettingsService);
  });

  it('should expose apiUrl from environment', () => {
    expect(service.apiUrl).toBe(apiBase);
  });

  it('should get project settings and map response', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      let result: ProjectSettingsModel | undefined;

      service.getProjectSettings(MOCK_PROJECT_ID).subscribe((value) => (result = value));

      const req = httpMock.expectOne(`${apiBase}/nodes/${MOCK_PROJECT_ID}/settings/`);
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PROJECT_SETTINGS_API_RESPONSE);

      expect(result).toEqual({
        id: MOCK_PROJECT_ID,
        attributes: {
          accessRequestsEnabled: true,
          anyoneCanEditWiki: false,
          wikiEnabled: true,
        },
      });
      httpMock.verify();
    }
  ));

  it('should update project settings and map response', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      let result: ProjectSettingsModel | undefined;

      service.updateProjectSettings(MOCK_PROJECT_SETTINGS_PATCH_DATA).subscribe((value) => (result = value));

      const req = httpMock.expectOne(`${apiBase}/nodes/${MOCK_PROJECT_ID}/settings/`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ data: MOCK_PROJECT_SETTINGS_PATCH_DATA });
      req.flush({ data: MOCK_PROJECT_SETTINGS_PATCH_DATA });

      expect(result).toEqual({
        id: MOCK_PROJECT_ID,
        attributes: {
          accessRequestsEnabled: false,
          anyoneCanEditWiki: true,
          wikiEnabled: false,
        },
      });
      httpMock.verify();
    }
  ));

  it('should get notification subscriptions with node filter and map response', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      let result: NotificationSubscription[] | undefined;

      service.getNotificationSubscriptions(MOCK_PROJECT_ID).subscribe((value) => (result = value));

      const req = httpMock.expectOne(
        (request) => request.url === `${apiBase}/subscriptions/` && request.method === 'GET'
      );
      expect(req.request.params.get('filter[id]')).toBe(`${MOCK_PROJECT_ID}_file_updated`);
      req.flush({ data: [MOCK_NOTIFICATION_SUBSCRIPTION_API] });

      expect(result).toEqual([
        {
          id: MOCK_NOTIFICATION_SUBSCRIPTION_API.id,
          event: SubscriptionEvent.FileUpdated,
          frequency: SubscriptionFrequency.Instant,
        },
      ]);
      httpMock.verify();
    }
  ));

  it('should update subscription with mapped request and response', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      const subscriptionId = MOCK_NOTIFICATION_SUBSCRIPTION_API.id;
      let result: NotificationSubscription | undefined;

      service.updateSubscription(subscriptionId, SubscriptionFrequency.Daily).subscribe((value) => (result = value));

      const req = httpMock.expectOne(`${apiBase}/subscriptions/${subscriptionId}/`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({
        data: {
          type: SubscriptionType.Global,
          attributes: { frequency: SubscriptionFrequency.Daily },
          id: subscriptionId,
        },
      });
      req.flush({
        data: {
          ...MOCK_NOTIFICATION_SUBSCRIPTION_API,
          attributes: { event_name: SubscriptionEvent.FileUpdated, frequency: SubscriptionFrequency.Daily },
        },
      });

      expect(result).toEqual({
        id: subscriptionId,
        event: SubscriptionEvent.FileUpdated,
        frequency: SubscriptionFrequency.Daily,
      });
      httpMock.verify();
    }
  ));

  it('should get project by id with embed params and map response', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      let result: NodeDetailsModel | undefined;

      service.getProjectById(MOCK_PROJECT_ID).subscribe((value) => (result = value));

      const req = httpMock.expectOne(
        (request) => request.url === `${apiBase}/nodes/${MOCK_PROJECT_ID}/` && request.method === 'GET'
      );
      expect(req.request.params.getAll('embed[]')).toEqual(['affiliated_institutions', 'region']);
      req.flush({ data: MOCK_NODE_DATA_JSON_API });

      expect(result).toEqual(
        expect.objectContaining({
          id: MOCK_PROJECT_ID,
          title: 'Test Project',
          description: 'Test Description',
          isPublic: true,
          region: { id: 'us-east-1', name: 'US East' },
          affiliatedInstitutions: [],
          rootId: 'root-project-id',
        })
      );
      httpMock.verify();
    }
  ));

  it('should update project by id and map response', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      const updateModel: UpdateNodeRequestModel = {
        data: {
          type: 'nodes',
          id: MOCK_PROJECT_ID,
          attributes: { title: 'Updated Title', description: 'Updated Description' },
        },
      };
      let result: NodeDetailsModel | undefined;

      service.updateProjectById(updateModel).subscribe((value) => (result = value));

      const req = httpMock.expectOne(`${apiBase}/nodes/${MOCK_PROJECT_ID}/`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateModel);
      req.flush({
        data: {
          ...MOCK_NODE_DATA_JSON_API,
          attributes: {
            ...MOCK_NODE_DATA_JSON_API.attributes,
            title: 'Updated Title',
            description: 'Updated Description',
          },
        },
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: MOCK_PROJECT_ID,
          title: 'Updated Title',
          description: 'Updated Description',
        })
      );
      httpMock.verify();
    }
  ));

  it('should delete projects with bulk payload and headers', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      const projects: NodeShortInfoModel[] = [
        { id: 'node-1', title: 'Node 1', isPublic: true, permissions: [] },
        { id: 'node-2', title: 'Node 2', isPublic: false, permissions: [] },
      ];
      let completed = false;

      service.deleteProject(projects).subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${apiBase}/nodes/`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({
        data: [
          { id: 'node-1', type: 'nodes' },
          { id: 'node-2', type: 'nodes' },
        ],
      });
      expect(req.request.headers.get('Content-Type')).toBe('application/vnd.api+json; ext=bulk');
      req.flush(null);

      expect(completed).toBe(true);
      httpMock.verify();
    }
  ));

  it('should delete institution relationship from project', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      const institutionId = 'inst-1';
      let completed = false;

      service.deleteInstitution(institutionId, MOCK_PROJECT_ID).subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${apiBase}/institutions/${institutionId}/relationships/nodes/`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ data: [{ id: MOCK_PROJECT_ID, type: 'nodes' }] });
      req.flush(null);

      expect(completed).toBe(true);
      httpMock.verify();
    }
  ));

  it('should propagate errors from getProjectSettings', inject(
    [HttpTestingController],
    (httpMock: HttpTestingController) => {
      let errorStatus: number | undefined;

      service.getProjectSettings('error-node').subscribe({
        error: (error) => {
          errorStatus = error.status;
        },
      });

      const req = httpMock.expectOne(`${apiBase}/nodes/error-node/settings/`);
      req.flush({ errors: [{ detail: 'boom' }] }, { status: 500, statusText: 'Server Error' });

      expect(errorStatus).toBe(500);
      httpMock.verify();
    }
  ));
});
