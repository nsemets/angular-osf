import { Selector } from '@ngxs/store';

import { ReviewAction } from '@osf/features/moderation/models';
import { RegistrationOverviewModel } from '@osf/features/registry/models';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { IdentifierModel } from '@osf/shared/models/identifiers/identifier.model';
import { LicenseModel } from '@osf/shared/models/license/license.model';
import { SchemaResponse } from '@osf/shared/models/registration/schema-response.model';
import { Institution } from '@shared/models/institutions/institutions.models';
import { PageSchema } from '@shared/models/registration/page-schema.model';

import { RegistryOverviewStateModel } from './registry-overview.model';
import { RegistryOverviewState } from './registry-overview.state';

export class RegistryOverviewSelectors {
  @Selector([RegistryOverviewState])
  static getRegistry(state: RegistryOverviewStateModel): RegistrationOverviewModel | null {
    return state.registry.data;
  }

  @Selector([RegistryOverviewState])
  static isRegistryLoading(state: RegistryOverviewStateModel): boolean {
    return state.registry.isLoading;
  }

  @Selector([RegistryOverviewState])
  static isRegistryAnonymous(state: RegistryOverviewStateModel): boolean {
    return state.isAnonymous;
  }

  @Selector([RegistryOverviewState])
  static getInstitutions(state: RegistryOverviewStateModel): Institution[] | null {
    return state.institutions.data;
  }

  @Selector([RegistryOverviewState])
  static isInstitutionsLoading(state: RegistryOverviewStateModel): boolean {
    return state.institutions.isLoading;
  }

  @Selector([RegistryOverviewState])
  static getSchemaBlocks(state: RegistryOverviewStateModel): PageSchema[] | null {
    return state.schemaBlocks.data;
  }

  @Selector([RegistryOverviewState])
  static isSchemaBlocksLoading(state: RegistryOverviewStateModel): boolean {
    return state.schemaBlocks.isLoading;
  }

  @Selector([RegistryOverviewState])
  static getReviewActions(state: RegistryOverviewStateModel): ReviewAction[] {
    return state.moderationActions.data;
  }

  @Selector([RegistryOverviewState])
  static areReviewActionsLoading(state: RegistryOverviewStateModel): boolean {
    return state.moderationActions.isLoading;
  }

  @Selector([RegistryOverviewState])
  static isReviewActionSubmitting(state: RegistryOverviewStateModel): boolean {
    return state.moderationActions.isSubmitting || false;
  }

  @Selector([RegistryOverviewState])
  static getIdentifiers(state: RegistryOverviewStateModel): IdentifierModel[] {
    return state.identifiers.data;
  }

  @Selector([RegistryOverviewState])
  static isIdentifiersLoading(state: RegistryOverviewStateModel): boolean {
    return state.identifiers.isLoading;
  }

  @Selector([RegistryOverviewState])
  static getLicense(state: RegistryOverviewStateModel): LicenseModel | null {
    return state.license.data;
  }

  @Selector([RegistryOverviewState])
  static isLicenseLoading(state: RegistryOverviewStateModel): boolean {
    return state.license.isLoading;
  }

  @Selector([RegistryOverviewState])
  static getSchemaResponses(state: RegistryOverviewStateModel): SchemaResponse[] {
    return state.schemaResponses.data;
  }

  @Selector([RegistryOverviewState])
  static isSchemaResponsesLoading(state: RegistryOverviewStateModel): boolean {
    return state.schemaResponses.isLoading;
  }

  @Selector([RegistryOverviewState])
  static hasWriteAccess(state: RegistryOverviewStateModel): boolean {
    return state.registry.data?.currentUserPermissions.includes(UserPermissions.Write) || false;
  }

  @Selector([RegistryOverviewState])
  static hasAdminAccess(state: RegistryOverviewStateModel): boolean {
    return state.registry.data?.currentUserPermissions.includes(UserPermissions.Admin) || false;
  }

  @Selector([RegistryOverviewState])
  static getSchemaResponse(state: RegistryOverviewStateModel): SchemaResponse | null {
    return state.currentSchemaResponse.data;
  }

  @Selector([RegistryOverviewState])
  static getSchemaResponseLoading(state: RegistryOverviewStateModel): boolean {
    return state.currentSchemaResponse.isLoading || !!state.currentSchemaResponse.isSubmitting;
  }
}
