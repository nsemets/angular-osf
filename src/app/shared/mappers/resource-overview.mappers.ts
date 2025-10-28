import { ProjectOverview } from '@osf/features/project/overview/models';
import { RegistryOverview } from '@osf/features/registry/models';

import { ContributorModel, Institution, ResourceOverview, SubjectModel } from '../models';

export function MapProjectOverview(
  project: ProjectOverview,
  subjects: SubjectModel[],
  isAnonymous = false,
  bibliographicContributors: ContributorModel[] = []
): ResourceOverview {
  return {
    id: project.id,
    type: project.type,
    title: project.title,
    description: project.description,
    dateModified: project.dateModified,
    dateCreated: project.dateCreated,
    isPublic: project.isPublic,
    category: project.category,
    isRegistration: project.isRegistration,
    isPreprint: project.isPreprint,
    isFork: project.isFork,
    isCollection: project.isCollection,
    tags: project.tags || [],
    accessRequestsEnabled: project.accessRequestsEnabled,
    nodeLicense: project.nodeLicense,
    license: project.license || undefined,
    storage: project.storage || undefined,
    identifiers: project.identifiers?.filter(Boolean) || undefined,
    supplements: project.supplements?.filter(Boolean) || undefined,
    analyticsKey: project.analyticsKey,
    currentUserCanComment: project.currentUserCanComment,
    currentUserPermissions: project.currentUserPermissions || [],
    currentUserIsContributor: project.currentUserIsContributor,
    currentUserIsContributorOrGroupMember: project.currentUserIsContributorOrGroupMember,
    wikiEnabled: project.wikiEnabled,
    subjects: subjects,
    contributors: bibliographicContributors?.filter(Boolean) || [],
    customCitation: project.customCitation || null,
    region: project.region || undefined,
    affiliatedInstitutions: project.affiliatedInstitutions?.filter(Boolean) || undefined,
    forksCount: project.forksCount || 0,
    viewOnlyLinksCount: project.viewOnlyLinksCount || 0,
    isAnonymous,
  };
}

export function MapRegistryOverview(
  registry: RegistryOverview,
  subjects: SubjectModel[],
  institutions: Institution[],
  isAnonymous = false
): ResourceOverview {
  return {
    id: registry.id,
    title: registry.title,
    type: registry.type,
    description: registry.description,
    dateModified: registry.dateModified,
    dateCreated: registry.dateCreated,
    dateRegistered: registry.dateRegistered,
    isPublic: registry.isPublic,
    category: registry.category,
    isRegistration: true,
    isPreprint: false,
    isCollection: false,
    isFork: registry.isFork,
    tags: registry.tags || [],
    accessRequestsEnabled: registry.accessRequestsEnabled,
    nodeLicense: registry.nodeLicense,
    license: registry.license || undefined,
    identifiers: registry.identifiers?.filter(Boolean) || undefined,
    analyticsKey: registry.analyticsKey,
    registrationType: registry.registrationType,
    currentUserCanComment: registry.currentUserCanComment,
    currentUserPermissions: registry.currentUserPermissions || [],
    currentUserIsContributor: registry.currentUserIsContributor,
    currentUserIsContributorOrGroupMember: registry.currentUserIsContributorOrGroupMember,
    wikiEnabled: registry.wikiEnabled,
    contributors: registry.contributors?.filter(Boolean) || [],
    region: registry.region || undefined,
    forksCount: registry.forksCount,
    subjects: subjects,
    customCitation: registry.customCitation,
    affiliatedInstitutions: institutions,
    associatedProjectId: registry.associatedProjectId,
    isAnonymous,
    iaUrl: registry.iaUrl,
  };
}
