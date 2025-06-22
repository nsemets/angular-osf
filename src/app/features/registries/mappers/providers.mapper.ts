import { Provider } from '../models';
import { ProvidersResponseJsonApi } from '../models/providers-json-api.model';

export class ProvidersMapper {
  static fromProvidersResponse(response: ProvidersResponseJsonApi): Provider[] {
    return response.data.map((item) => ({
      id: item.id,
      name: item.attributes.name,
    }));
  }
}
