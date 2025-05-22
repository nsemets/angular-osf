import { ViewOnlyLinkCreatorModel, ViewOnlyLinkNodeModel } from '@osf/features/project/settings';

export interface LinkTableModel {
  id: string;
  sharedComponents: string;
  createdDate: string | Date;
  createdBy: ViewOnlyLinkCreatorModel;
  nodes: ViewOnlyLinkNodeModel[];
  anonymous: boolean;
  link: string;
}
