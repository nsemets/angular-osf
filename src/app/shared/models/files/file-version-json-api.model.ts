import { ApiData, JsonApiResponse } from '../common/json-api.model';

export type FileVersionsResponseJsonApi = JsonApiResponse<
  ApiData<FileVersionAttributesJsonApi, null, null, FileVersionLinksJsonApi>[],
  null
>;

export interface FileVersionAttributesJsonApi {
  size: number;
  content_type: string;
  date_created: Date;
  name: string;
}

export interface FileVersionLinksJsonApi {
  download: string;
}
