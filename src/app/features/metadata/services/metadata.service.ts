import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { inject, Injectable } from '@angular/core';

import { ENVIRONMENT } from '@core/provider/environment.provider';
import { ResourceType } from '@osf/shared/enums/resource-type.enum';
import { BaseNodeAttributesJsonApi, Identifier, LicenseOptions } from '@osf/shared/models';
import { JsonApiService } from '@osf/shared/services/json-api.service';

import { CedarRecordsMapper, MetadataMapper } from '../mappers';
import {
  CedarMetadataRecord,
  CedarMetadataRecordJsonApi,
  CedarMetadataTemplateJsonApi,
  CedarRecordDataBinding,
  CustomMetadataJsonApi,
  CustomMetadataJsonApiResponse,
  MetadataJsonApi,
  MetadataJsonApiResponse,
} from '../models';
import { CrossRefFundersResponse, CustomItemMetadataRecord, MetadataModel } from '../models/metadata.model';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private readonly jsonApiService = inject(JsonApiService);
  private readonly environment = inject(ENVIRONMENT);

  get apiUrl() {
    return `${this.environment.apiDomainUrl}/v2`;
  }

  get apiDomainUrl() {
    return this.environment.apiDomainUrl;
  }

  get funderApiUrl() {
    return this.environment.funderApiUrl;
  }

  private readonly urlMap = new Map<ResourceType, string>([
    [ResourceType.Project, 'nodes'],
    [ResourceType.Registration, 'registrations'],
    [ResourceType.File, 'files'],
  ]);

  getCustomItemMetadata(guid: string): Observable<CustomItemMetadataRecord> {
    return this.jsonApiService
      .get<CustomMetadataJsonApiResponse>(`${this.apiUrl}/custom_item_metadata_records/${guid}/`)
      .pipe(map((response) => MetadataMapper.fromCustomMetadataApiResponse(response.data)));
  }

  updateCustomItemMetadata(guid: string, metadata: CustomItemMetadataRecord): Observable<CustomItemMetadataRecord> {
    const payload = MetadataMapper.toCustomMetadataApiRequest(guid, metadata);

    return this.jsonApiService
      .put<CustomMetadataJsonApi>(`${this.apiUrl}/custom_item_metadata_records/${guid}/`, payload)
      .pipe(map((response) => MetadataMapper.fromCustomMetadataApiResponse(response)));
  }

  createDoi(resourceId: string, resourceType: ResourceType): Observable<Identifier> {
    const payload = {
      data: {
        type: 'identifiers',
        attributes: {
          category: 'doi',
        },
      },
    };

    return this.jsonApiService.post(
      `${this.apiUrl}/${this.urlMap.get(resourceType)}/${resourceId}/identifiers/`,
      payload
    );
  }

  getFundersList(searchQuery?: string): Observable<CrossRefFundersResponse> {
    let url = `${this.funderApiUrl}funders?mailto=support%40osf.io`;

    if (searchQuery && searchQuery.trim()) {
      url += `&query=${encodeURIComponent(searchQuery.trim())}`;
    }

    return this.jsonApiService.get<CrossRefFundersResponse>(url);
  }

  getMetadataCedarTemplates(url?: string): Observable<CedarMetadataTemplateJsonApi> {
    return this.jsonApiService.get<CedarMetadataTemplateJsonApi>(
      url || `${this.apiDomainUrl}/_/cedar_metadata_templates/`
    );
  }

  getMetadataCedarRecords(
    resourceId: string,
    resourceType: ResourceType,
    url?: string
  ): Observable<CedarMetadataRecordJsonApi> {
    const params: Record<string, unknown> = {
      embed: 'template',
      'page[size]': 20,
    };

    // [NS] TODO: Check if it can be simplified
    let cedarUrl = `${this.apiUrl}/${this.urlMap.get(resourceType)}/${resourceId}/cedar_metadata_records/`;

    if (url) {
      cedarUrl = this.getMetadataUrl(url);
    }

    return this.jsonApiService.get<CedarMetadataRecordJsonApi>(cedarUrl, params);
  }

  createMetadataCedarRecord(
    data: CedarRecordDataBinding,
    resourceId: string,
    resourceType: ResourceType
  ): Observable<CedarMetadataRecord> {
    const payload = CedarRecordsMapper.toCedarRecordsPayload(data, resourceId, this.urlMap.get(resourceType) as string);
    return this.jsonApiService.post<CedarMetadataRecord>(`${this.apiDomainUrl}/_/cedar_metadata_records/`, payload);
  }

  updateMetadataCedarRecord(
    data: CedarRecordDataBinding,
    recordId: string,
    resourceId: string,
    resourceType: ResourceType
  ): Observable<CedarMetadataRecord> {
    const payload = CedarRecordsMapper.toCedarRecordsPayload(data, resourceId, this.urlMap.get(resourceType) as string);

    return this.jsonApiService.patch<CedarMetadataRecord>(
      `${this.apiDomainUrl}/_/cedar_metadata_records/${recordId}/`,
      payload
    );
  }

  getResourceMetadata(resourceId: string, resourceType: ResourceType): Observable<Partial<MetadataModel>> {
    const params = this.getMetadataParams(resourceType);

    const baseUrl = `${this.apiUrl}/${this.urlMap.get(resourceType)}/${resourceId}/`;

    return this.jsonApiService
      .get<MetadataJsonApiResponse>(baseUrl, params)
      .pipe(map((response) => MetadataMapper.fromMetadataApiResponse(response.data)));
  }

  updateResourceDetails(
    resourceId: string,
    resourceType: ResourceType,
    updates: Partial<BaseNodeAttributesJsonApi>
  ): Observable<MetadataModel> {
    const payload = {
      data: {
        id: resourceId,
        type: this.urlMap.get(resourceType),
        attributes: updates,
      },
    };

    const baseUrl = `${this.apiUrl}/${this.urlMap.get(resourceType)}/${resourceId}/`;
    const params = this.getMetadataParams(resourceType);

    return this.jsonApiService
      .patch<MetadataJsonApi>(baseUrl, payload, params)
      .pipe(map((response) => MetadataMapper.fromMetadataApiResponse(response)));
  }

  updateResourceLicense(
    resourceId: string,
    resourceType: ResourceType,
    licenseId: string,
    licenseOptions?: LicenseOptions
  ): Observable<MetadataModel> {
    const payload = {
      data: {
        id: resourceId,
        type: this.urlMap.get(resourceType),
        relationships: {
          license: {
            data: {
              id: licenseId,
              type: 'licenses',
            },
          },
        },
        attributes: {
          ...(licenseOptions && {
            node_license: {
              copyright_holders: [licenseOptions.copyrightHolders],
              year: licenseOptions.year,
            },
          }),
        },
      },
    };

    const baseUrl = `${this.apiUrl}/${this.urlMap.get(resourceType)}/${resourceId}/`;
    const params = this.getMetadataParams(resourceType);

    return this.jsonApiService
      .patch<MetadataJsonApi>(baseUrl, payload, params)
      .pipe(map((response) => MetadataMapper.fromMetadataApiResponse(response)));
  }

  private getMetadataParams(resourceType: ResourceType): Record<string, unknown> {
    const params = {
      embed: ['affiliated_institutions', 'identifiers', 'license'],
    };

    if (resourceType === ResourceType.Registration) {
      params['embed'].push('provider');
    }

    return params;
  }

  private getMetadataUrl(url: string): string {
    const parsedUrl = new URL(url);

    if (!parsedUrl.pathname.endsWith('/')) {
      parsedUrl.pathname += '/';
    }

    parsedUrl.pathname += 'cedar_metadata_records/';

    return parsedUrl.toString();
  }
}
