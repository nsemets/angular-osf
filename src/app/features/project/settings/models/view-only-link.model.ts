export interface ViewOnlyLinkCreatorModel {
  fullname: string;
  url: string;
}

export interface ViewOnlyLinkNodeModel {
  title: string;
  url: string;
  scale: string;
  category: string;
}

export interface ViewOnlyLinkModel {
  id: string;
  date_created: string;
  key: string;
  name: string;
  creator: ViewOnlyLinkCreatorModel;
  nodes: ViewOnlyLinkNodeModel[];
  anonymous: boolean;
}
