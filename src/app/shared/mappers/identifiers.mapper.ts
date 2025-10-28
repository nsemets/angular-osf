import { Identifier, IdentifiersResponseJsonApi } from '@shared/models';

export class IdentifiersMapper {
  static fromJsonApi(response: IdentifiersResponseJsonApi | undefined): Identifier[] {
    if (!response || !response.data) {
      return [];
    }

    return response?.data.map((rawIdentifier) => ({
      id: rawIdentifier.id,
      type: rawIdentifier.type,
      category: rawIdentifier.attributes.category,
      value: rawIdentifier.attributes.value,
    }));
  }
}
