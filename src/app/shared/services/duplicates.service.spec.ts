import { MockProvider } from 'ng-mocks';

import { firstValueFrom } from 'rxjs';

import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ENVIRONMENT_DO_NO_USE } from '@core/constants/environment.token';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';

import { getDuplicatesForksResponse } from '@testing/data/duplicates/duplicates.data';
import { provideOSFCore, provideOSFHttp } from '@testing/osf.testing.provider';

import { DuplicatesService } from './duplicates.service';

const API_URL = 'http://localhost:8000/v2';

describe('DuplicatesService', () => {
  let service: DuplicatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideOSFCore(),
        provideOSFHttp(),
        MockProvider(ENVIRONMENT_DO_NO_USE, {
          production: false,
          apiDomainUrl: 'http://localhost:8000',
          webUrl: 'http://localhost:4200',
        }),
        DuplicatesService,
      ],
    });

    service = TestBed.inject(DuplicatesService);
  });

  it('should expose apiUrl from environment', () => {
    expect(service.apiUrl).toBe(API_URL);
  });

  it('fetchAllDuplicates should GET project forks with embed params', async () => {
    const httpMock = TestBed.inject(HttpTestingController);

    const resultPromise = firstValueFrom(service.fetchAllDuplicates('project-1', ResourceType.Project, 2, 10));

    const req = httpMock.expectOne(
      (request) => request.url === `${API_URL}/nodes/project-1/forks/` && request.method === 'GET'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('embed')).toBe('bibliographic_contributors');
    expect(req.request.params.get('fields[users]')).toBe('family_name,full_name,given_name,middle_name');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('page[size]')).toBe('10');
    req.flush(getDuplicatesForksResponse());

    const result = await resultPromise;
    expect(result.totalCount).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('fork-1');
    expect(result.data[0].title).toBe('Fork Title');
    expect(result.data[0].isFork).toBe(true);
    expect(result.data[0].bibliographicContributors).toEqual([]);

    httpMock.verify();
  });

  it('fetchAllDuplicates should GET registration forks', async () => {
    const httpMock = TestBed.inject(HttpTestingController);

    const resultPromise = firstValueFrom(service.fetchAllDuplicates('registration-1', ResourceType.Registration));

    const req = httpMock.expectOne(
      (request) => request.url === `${API_URL}/registrations/registration-1/forks/` && request.method === 'GET'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBeNull();
    expect(req.request.params.get('page[size]')).toBeNull();
    req.flush(getDuplicatesForksResponse());

    const result = await resultPromise;
    expect(result.data[0].id).toBe('fork-1');

    httpMock.verify();
  });

  it('fetchAllDuplicates should propagate HTTP errors', async () => {
    const httpMock = TestBed.inject(HttpTestingController);

    const resultPromise = firstValueFrom(service.fetchAllDuplicates('project-1', ResourceType.Project));

    const req = httpMock.expectOne(
      (request) => request.url === `${API_URL}/nodes/project-1/forks/` && request.method === 'GET'
    );
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    await expect(resultPromise).rejects.toBeTruthy();

    httpMock.verify();
  });
});
