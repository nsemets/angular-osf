import { replaceBadEncodedChars } from '@shared/helpers/format-bad-encoding.helper';

import { FileCustomMetadataDataJsonApi, OsfFileCustomMetadata } from '../models';

export function MapFileCustomMetadata(data: FileCustomMetadataDataJsonApi): OsfFileCustomMetadata {
  return {
    id: data.id,
    description: replaceBadEncodedChars(data.attributes.description),
    language: data.attributes.language,
    resourceTypeGeneral: data.attributes.resource_type_general,
    title: replaceBadEncodedChars(data.attributes.title),
  };
}
