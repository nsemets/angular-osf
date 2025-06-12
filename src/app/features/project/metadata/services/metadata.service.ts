import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { CedarMetadataTemplate } from '@osf/features/project/metadata/models';

import { environment } from '../../../../../environments/environment';
import {
  CrossRefFundersResponse,
  CustomItemMetadataRecord,
  CustomItemMetadataResponse,
  FundingInfo,
  LicenseData,
  MetadataResponse,
  MetadataUpdateResponse,
  ProjectMetadata,
  ResourceInformation,
} from '../models/metadata.models';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getProjectMetadata(projectId: string): Observable<MetadataResponse> {
    return this.http.get<MetadataResponse>(`${this.apiUrl}/v2/nodes/${projectId}/custom_metadata/`);
  }

  updateProjectMetadata(projectId: string, metadata: ProjectMetadata): Observable<MetadataUpdateResponse> {
    return this.http.put<MetadataUpdateResponse>(`${this.apiUrl}/v2/nodes/${projectId}/custom_metadata/`, {
      data: {
        type: 'custom_metadata',
        attributes: metadata,
      },
    });
  }

  // For specific metadata sections
  updateDescription(projectId: string, description: string): Observable<MetadataUpdateResponse> {
    return this.http.patch<MetadataUpdateResponse>(`${this.apiUrl}/v2/nodes/${projectId}/`, {
      data: {
        type: 'nodes',
        id: projectId,
        attributes: {
          description,
        },
      },
    });
  }

  updateLicense(projectId: string, licenseData: LicenseData): Observable<MetadataUpdateResponse> {
    return this.http.put<MetadataUpdateResponse>(`${this.apiUrl}/v2/nodes/${projectId}/license/`, {
      data: {
        type: 'node-licenses',
        attributes: licenseData,
      },
    });
  }

  updateResourceInformation(projectId: string, resourceInfo: ResourceInformation): Observable<MetadataUpdateResponse> {
    return this.updateProjectMetadata(projectId, {
      resource_type: resourceInfo.resourceType,
      resource_language: resourceInfo.resourceLanguage,
    });
  }

  updateFunding(projectId: string, fundingData: FundingInfo[]): Observable<MetadataUpdateResponse> {
    return this.updateProjectMetadata(projectId, {
      funding_info: fundingData,
    });
  }

  updatePublicationDoi(projectId: string, publicationDoi: string): Observable<MetadataUpdateResponse> {
    return this.updateProjectMetadata(projectId, {
      publication_doi: publicationDoi,
    });
  }

  createDoi(projectId: string): Observable<MetadataUpdateResponse> {
    return this.http.post<MetadataUpdateResponse>(`${this.apiUrl}/v2/nodes/${projectId}/identifiers/`, {
      data: {
        type: 'identifiers',
        attributes: {
          category: 'doi',
        },
      },
    });
  }

  updateDoi(projectId: string, doi: string): Observable<MetadataUpdateResponse> {
    return this.updateProjectMetadata(projectId, {
      doi,
    });
  }

  updateAffiliatedInstitutions(projectId: string, institutionIds: string[]): Observable<MetadataUpdateResponse> {
    return this.http.put<MetadataUpdateResponse>(`${this.apiUrl}/v2/nodes/${projectId}/institutions/`, {
      data: institutionIds.map((id) => ({
        type: 'institutions',
        id,
      })),
    });
  }

  getCustomItemMetadata(guid: string): Observable<CustomItemMetadataResponse> {
    return this.http.get<CustomItemMetadataResponse>(`${this.apiUrl}/custom_item_metadata_records/${guid}/`);
  }

  updateCustomItemMetadata(guid: string, metadata: CustomItemMetadataRecord): Observable<CustomItemMetadataResponse> {
    return this.http.put<CustomItemMetadataResponse>(`${this.apiUrl}/custom_item_metadata_records/${guid}/`, {
      data: {
        type: 'custom-item-metadata-records',
        attributes: metadata,
      },
    });
  }

  getFundersList(searchQuery?: string): Observable<CrossRefFundersResponse> {
    let url = `https://api.crossref.org/funders?mailto=support@staging4osf.io`;

    if (searchQuery && searchQuery.trim()) {
      url += `&query=${encodeURIComponent(searchQuery.trim())}`;
    }

    return this.http.get<CrossRefFundersResponse>(url);
  }

  getMetadataCedarTemplates(url?: string): Observable<CedarMetadataTemplate> {
    return this.http.get<CedarMetadataTemplate>(url || 'https://api.staging4.osf.io/_/cedar_metadata_templates/');
  }
}
