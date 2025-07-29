import { Selector } from '@ngxs/store';

import { RegistryLinksStateModel } from './registry-links.model';
import { RegistryLinksState } from './registry-links.state';

export class RegistryLinksSelectors {
  @Selector([RegistryLinksState])
  static getLinkedNodes(state: RegistryLinksStateModel) {
    return state.linkedNodes.data;
  }

  @Selector([RegistryLinksState])
  static getLinkedNodesLoading(state: RegistryLinksStateModel) {
    return state.linkedNodes.isLoading;
  }

  @Selector([RegistryLinksState])
  static getLinkedNodesMeta(state: RegistryLinksStateModel) {
    return state.linkedNodes.meta;
  }

  @Selector([RegistryLinksState])
  static getLinkedNodesLinks(state: RegistryLinksStateModel) {
    return state.linkedNodes.links;
  }

  @Selector([RegistryLinksState])
  static getLinkedRegistrations(state: RegistryLinksStateModel) {
    return state.linkedRegistrations.data;
  }

  @Selector([RegistryLinksState])
  static getLinkedRegistrationsLoading(state: RegistryLinksStateModel) {
    return state.linkedRegistrations.isLoading;
  }

  @Selector([RegistryLinksState])
  static getLinkedRegistrationsMeta(state: RegistryLinksStateModel) {
    return state.linkedRegistrations.meta;
  }

  @Selector([RegistryLinksState])
  static getLinkedRegistrationsLinks(state: RegistryLinksStateModel) {
    return state.linkedRegistrations.links;
  }

  @Selector([RegistryLinksState])
  static getDeleteLoading(state: RegistryLinksStateModel) {
    return state.deleteLoading;
  }

  @Selector([RegistryLinksState])
  static getBibliographicContributors(state: RegistryLinksStateModel) {
    return state.bibliographicContributors.data;
  }

  @Selector([RegistryLinksState])
  static getBibliographicContributorsLoading(state: RegistryLinksStateModel) {
    return state.bibliographicContributors.isLoading;
  }

  @Selector([RegistryLinksState])
  static getBibliographicContributorsNodeId(state: RegistryLinksStateModel) {
    return state.bibliographicContributors.nodeId;
  }

  @Selector([RegistryLinksState])
  static getBibliographicContributorsForRegistration(state: RegistryLinksStateModel) {
    return state.bibliographicContributorsForRegistration.data;
  }

  @Selector([RegistryLinksState])
  static getBibliographicContributorsForRegistrationLoading(state: RegistryLinksStateModel) {
    return state.bibliographicContributorsForRegistration.isLoading;
  }

  @Selector([RegistryLinksState])
  static getBibliographicContributorsForRegistrationId(state: RegistryLinksStateModel) {
    return state.bibliographicContributorsForRegistration.registrationId;
  }
}
