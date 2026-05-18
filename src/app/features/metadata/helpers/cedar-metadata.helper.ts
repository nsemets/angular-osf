import { CedarTemplate } from '../models';

export class CedarMetadataHelper {
  static buildCedarSystemMetadata(template: CedarTemplate): Record<string, unknown> {
    const now = new Date().toISOString();
    return {
      '@id': '',
      '@context': template['@context'] ?? {},
      'schema:isBasedOn': template['@id'] ?? '',
      'schema:name': '',
      'schema:description': '',
      'pav:createdBy': '',
      'oslc:modifiedBy': '',
      'pav:createdOn': now,
      'pav:lastUpdatedOn': now,
    };
  }

  static ensureProperStructure(items: unknown): Record<string, unknown>[] {
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
      const safeItem = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};

      return {
        '@id': safeItem['@id'] ?? '',
        '@type': safeItem['@type'] ?? '',
        'rdfs:label': safeItem['rdfs:label'] ?? null,
      };
    });
  }

  static buildStructuredMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
    const keysToFix = [
      'Constructs',
      'Assessments',
      'Project Methods',
      'Participant Types',
      'Special Populations',
      'Educational Curricula',
      'LDbaseInvestigatorORCID',
    ];

    const fixedMetadata: Record<string, unknown> = { ...metadata };

    const raw = metadata as Record<string, unknown>;

    for (const key of keysToFix) {
      const value = raw?.[key];
      if (value) {
        fixedMetadata[key] = this.ensureProperStructure(value);
      }
    }

    return fixedMetadata;
  }

  static buildEmptyMetadata(): Record<string, unknown> {
    return {
      '@context': {},
      Constructs: this.ensureProperStructure([]),
      Assessments: this.ensureProperStructure([]),
      'Project Methods': this.ensureProperStructure([]),
      'Participant Types': this.ensureProperStructure([]),
      'Special Populations': this.ensureProperStructure([]),
      'Educational Curricula': this.ensureProperStructure([]),
      LDbaseInvestigatorORCID: this.ensureProperStructure([]),
    };
  }

  static cleanMetadataForSubmission(metadata: Record<string, unknown>): Record<string, unknown> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (uuidRegex.test(key)) continue;
      if (key === '@context' && value && typeof value === 'object') {
        cleaned[key] = Object.fromEntries(
          Object.entries(value as Record<string, unknown>).filter(([k]) => !uuidRegex.test(k))
        );
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }
}
