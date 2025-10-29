import { ContributorModel } from '@shared/models';

import { LicensesOption } from '../license/license.model';

export interface BaseNodeModel {
  id: string;
  title: string;
  description: string;
  category: string;
  customCitation?: string;
  dateCreated: string;
  dateModified: string;
  isRegistration: boolean;
  isPreprint: boolean;
  isFork: boolean;
  isCollection: boolean;
  isPublic: boolean;
  tags: string[];
  accessRequestsEnabled: boolean;
  nodeLicense: LicensesOption;
  currentUserPermissions: string[];
  currentUserIsContributor: boolean;
  wikiEnabled: boolean;
  rootParentId?: string;
  type: string;
  parent?: BaseNodeModel;
}

export interface NodeModel extends BaseNodeModel {
  bibliographicContributors?: ContributorModel[];
}
