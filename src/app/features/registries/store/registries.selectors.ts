import { Selector } from '@ngxs/store';

import { FileModel } from '@osf/shared/models/files/file.model';
import { FileFolderModel } from '@osf/shared/models/files/file-folder.model';
import { LicenseModel } from '@osf/shared/models/license/license.model';
import { DraftRegistrationModel } from '@osf/shared/models/registration/draft-registration.model';
import { PageSchema } from '@osf/shared/models/registration/page-schema.model';
import { ProviderSchema } from '@osf/shared/models/registration/provider-schema.model';
import { RegistrationModel } from '@osf/shared/models/registration/registration.model';
import { RegistrationCard } from '@osf/shared/models/registration/registration-card.model';
import { SchemaResponse } from '@osf/shared/models/registration/schema-response.model';
import { ResourceModel } from '@osf/shared/models/search/resource.model';

import { ProjectShortInfoModel } from '../models';

import { RegistriesStateModel } from './registries.model';
import { RegistriesState } from './registries.state';

export class RegistriesSelectors {
  @Selector([RegistriesState])
  static getProviderSchemas(state: RegistriesStateModel): ProviderSchema[] {
    return state.providerSchemas.data;
  }

  @Selector([RegistriesState])
  static isProvidersLoading(state: RegistriesStateModel): boolean {
    return state.providerSchemas.isLoading;
  }

  @Selector([RegistriesState])
  static getProjects(state: RegistriesStateModel): ProjectShortInfoModel[] {
    return state.projects.data;
  }

  @Selector([RegistriesState])
  static isProjectsLoading(state: RegistriesStateModel): boolean {
    return state.projects.isLoading;
  }

  @Selector([RegistriesState])
  static isDraftSubmitting(state: RegistriesStateModel): boolean {
    return state.draftRegistration.isSubmitting ?? false;
  }

  @Selector([RegistriesState])
  static isDraftLoading(state: RegistriesStateModel): boolean {
    return state.draftRegistration.isLoading;
  }

  @Selector([RegistriesState])
  static getDraftRegistration(state: RegistriesStateModel): DraftRegistrationModel | null {
    return state.draftRegistration.data;
  }

  @Selector([RegistriesState])
  static getRegistrationLoading(state: RegistriesStateModel): boolean {
    return state.draftRegistration.isLoading || state.draftRegistration.isSubmitting || state.pagesSchema.isLoading;
  }

  @Selector([RegistriesState])
  static getRegistries(state: RegistriesStateModel): ResourceModel[] {
    return state.registries.data;
  }

  @Selector([RegistriesState])
  static isRegistriesLoading(state: RegistriesStateModel): boolean {
    return state.registries.isLoading;
  }

  @Selector([RegistriesState])
  static getLicenses(state: RegistriesStateModel): LicenseModel[] {
    return state.licenses.data;
  }

  @Selector([RegistriesState])
  static getSelectedLicense(state: RegistriesStateModel) {
    return state.draftRegistration.data?.license || null;
  }

  @Selector([RegistriesState])
  static getRegistrationLicense(state: RegistriesStateModel): LicenseModel | null {
    return state.licenses.data.find((l) => l.id === state.draftRegistration.data?.license.id) || null;
  }

  @Selector([RegistriesState])
  static getPagesSchema(state: RegistriesStateModel): PageSchema[] {
    return state.pagesSchema.data;
  }

  @Selector([RegistriesState])
  static getSelectedTags(state: RegistriesStateModel): string[] {
    return state.draftRegistration.data?.tags || [];
  }

  @Selector([RegistriesState])
  static getStepsState(state: RegistriesStateModel): Record<string, { invalid: boolean; touched: boolean }> {
    return state.stepsState;
  }

  @Selector([RegistriesState])
  static getStepsData(state: RegistriesStateModel) {
    return state.draftRegistration.data?.stepsData || {};
  }

  @Selector([RegistriesState])
  static isRegistrationSubmitting(state: RegistriesStateModel): boolean {
    return state.registration.isSubmitting || false;
  }

  @Selector([RegistriesState])
  static getRegistration(state: RegistriesStateModel): RegistrationModel | null {
    return state.registration.data;
  }

  @Selector([RegistriesState])
  static getDraftRegistrations(state: RegistriesStateModel): RegistrationCard[] {
    return state.draftRegistrations.data;
  }

  @Selector([RegistriesState])
  static isDraftRegistrationsLoading(state: RegistriesStateModel): boolean {
    return state.draftRegistrations.isLoading;
  }

  @Selector([RegistriesState])
  static getDraftRegistrationsTotalCount(state: RegistriesStateModel): number {
    return state.draftRegistrations.totalCount;
  }

  @Selector([RegistriesState])
  static getSubmittedRegistrations(state: RegistriesStateModel): RegistrationCard[] {
    return state.submittedRegistrations.data;
  }

  @Selector([RegistriesState])
  static isSubmittedRegistrationsLoading(state: RegistriesStateModel): boolean {
    return state.submittedRegistrations.isLoading;
  }

  @Selector([RegistriesState])
  static getSubmittedRegistrationsTotalCount(state: RegistriesStateModel): number {
    return state.submittedRegistrations.totalCount;
  }

  @Selector([RegistriesState])
  static getFiles(state: RegistriesStateModel): FileModel[] {
    return state.files.data;
  }

  @Selector([RegistriesState])
  static getFilesTotalCount(state: RegistriesStateModel): number {
    return state.files.totalCount;
  }

  @Selector([RegistriesState])
  static isFilesLoading(state: RegistriesStateModel): boolean {
    return state.files.isLoading;
  }

  @Selector([RegistriesState])
  static getRegistrationComponents(state: RegistriesStateModel) {
    return state.draftRegistration.data?.components || [];
  }

  @Selector([RegistriesState])
  static getCurrentFolder(state: RegistriesStateModel): FileFolderModel | null {
    return state.currentFolder;
  }

  @Selector([RegistriesState])
  static getSchemaResponse(state: RegistriesStateModel): SchemaResponse | null {
    return state.schemaResponse.data;
  }

  @Selector([RegistriesState])
  static getSchemaResponseLoading(state: RegistriesStateModel): boolean {
    return state.schemaResponse.isLoading || !!state.schemaResponse.isSubmitting;
  }

  @Selector([RegistriesState])
  static getSchemaResponseRevisionData(state: RegistriesStateModel) {
    return state.schemaResponse.data?.revisionResponses || {};
  }

  @Selector([RegistriesState])
  static getUpdatedFields(state: RegistriesStateModel): Record<string, unknown> {
    return state.updatedFields;
  }
}
