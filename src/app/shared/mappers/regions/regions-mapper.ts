import { IdName } from '@osf/shared/models/common/id-name.model';
import { RegionDataJsonApi, RegionsResponseJsonApi } from '@osf/shared/models/regions/regions.json-api.model';

export class RegionsMapper {
  static fromRegionsResponseJsonApi(response: RegionsResponseJsonApi): IdName[] {
    return response.data.map((data) => ({
      id: data.id,
      name: data.attributes.name,
    }));
  }

  static getRegion(data: RegionDataJsonApi): IdName {
    return {
      id: data.id,
      name: data.attributes.name,
    };
  }
}
