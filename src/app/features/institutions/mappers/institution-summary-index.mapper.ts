import {
  InstitutionIndexCardFilter,
  InstitutionIndexValueSearchIncludedJsonApi,
  InstitutionSearchFilter,
  InstitutionSearchResultCount,
} from '@osf/features/institutions/models';

export function mapIndexCardResults(included: InstitutionIndexValueSearchIncludedJsonApi[]): InstitutionSearchFilter[] {
  const indexCardMap = included.reduce(
    (acc, item) => {
      if (item.type === 'index-card') {
        acc[item.id] = {
          id: item.id,
          label:
            (item as InstitutionIndexCardFilter)?.attributes?.resourceMetadata?.displayLabel?.[0]?.['@value'] ||
            (item as InstitutionIndexCardFilter)?.attributes?.resourceMetadata?.name?.[0]?.['@value'] ||
            item.id,
        };
      }
      return acc;
    },
    {} as Record<string, { id: string; label: string }>
  );

  return included.reduce((result, item) => {
    if (item.type === 'search-result') {
      const indexCardId = (item as InstitutionSearchResultCount).relationships?.indexCard?.data?.id;
      const count = (item as InstitutionSearchResultCount).attributes?.cardSearchResultCount ?? 0;
      const indexCard = indexCardMap[indexCardId];
      if (indexCard) {
        result.push({
          id: indexCard.id,
          label: indexCard.label,
          value: count,
        } as InstitutionSearchFilter);
      }
    }
    return result;
  }, [] as InstitutionSearchFilter[]);
}
