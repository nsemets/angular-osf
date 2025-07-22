import { Selector } from '@ngxs/store';

import { RegistryMetadataStateModel } from './registry-metadata.model';
import { RegistryMetadataState } from './registry-metadata.state';

export class RegistryMetadataSelectors {
  @Selector([RegistryMetadataState])
  static getRegistry(state: RegistryMetadataStateModel) {
    return state.registry.data;
  }

  @Selector([RegistryMetadataState])
  static getRegistryLoading(state: RegistryMetadataStateModel) {
    return state.registry.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getBibliographicContributors(state: RegistryMetadataStateModel) {
    return state.bibliographicContributors.data;
  }

  @Selector([RegistryMetadataState])
  static getBibliographicContributorsLoading(state: RegistryMetadataStateModel) {
    return state.bibliographicContributors.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getCustomItemMetadata(state: RegistryMetadataStateModel) {
    return state.customItemMetadata.data;
  }

  @Selector([RegistryMetadataState])
  static getCustomItemMetadataLoading(state: RegistryMetadataStateModel) {
    return state.customItemMetadata.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getFundersList(state: RegistryMetadataStateModel) {
    return state.fundersList.data;
  }

  @Selector([RegistryMetadataState])
  static getFundersLoading(state: RegistryMetadataStateModel) {
    return state.fundersList.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getUserInstitutions(state: RegistryMetadataStateModel) {
    return state.userInstitutions.data;
  }

  @Selector([RegistryMetadataState])
  static getUserInstitutionsLoading(state: RegistryMetadataStateModel): boolean {
    return state.userInstitutions.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getSubjects(state: RegistryMetadataStateModel) {
    return state.subjects.data;
  }

  @Selector([RegistryMetadataState])
  static getSubjectsLoading(state: RegistryMetadataStateModel) {
    return state.subjects.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getCedarTemplates(state: RegistryMetadataStateModel) {
    return state.cedarTemplates.data;
  }

  @Selector([RegistryMetadataState])
  static getCedarTemplatesLoading(state: RegistryMetadataStateModel) {
    return state.cedarTemplates.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getCedarRecord(state: RegistryMetadataStateModel) {
    return state.cedarRecord.data;
  }

  @Selector([RegistryMetadataState])
  static getCedarRecordLoading(state: RegistryMetadataStateModel) {
    return state.cedarRecord.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getCedarRecords(state: RegistryMetadataStateModel) {
    return state.cedarRecords.data;
  }

  @Selector([RegistryMetadataState])
  static getCedarRecordsLoading(state: RegistryMetadataStateModel) {
    return state.cedarRecords.isLoading;
  }

  @Selector([RegistryMetadataState])
  static getError(state: RegistryMetadataStateModel) {
    return state.registry.error;
  }
}
