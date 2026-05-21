import { IdNameModel } from '../common/id-name.model';
import { BaseNodeModel } from '../nodes/base-node.model';
import { UserModel } from '../user/user.model';

export interface ActivityLog {
  id: string;
  type: string;
  action: string;
  date: string;
  params: {
    contributors: LogContributor[];
    license?: string;
    tag?: string;
    institution?: IdNameModel;
    paramsNode: { id: string; title: string };
    paramsProject: null;
    pointer: Pointer | null;
    template_node?: { id: string; url: string; title: string } | null;
    preprintProvider?: string | { url: string; name: string } | null;
    addon?: string;
    anonymousLink?: boolean;
    file?: { name: string; url: string };
    wiki?: { name: string; url: string };
    destination?: { materialized: string; addon: string; url: string };
    identifiers?: { doi?: string; ark?: string };
    kind?: string;
    oldPage?: string;
    page?: string;
    pageId?: string;
    path?: string;
    urls?: { view: string };
    preprint?: string;
    source?: { materialized: string; addon: string };
    titleNew?: string;
    titleOriginal?: string;
    updatedFields?: Record<string, { new: string; old: string }>;
    value?: string;
    version?: string;
    githubUser?: string;
  };
  embeds?: {
    originalNode?: BaseNodeModel;
    user?: UserModel;
    linkedNode?: BaseNodeModel;
  };
  isAnonymous?: boolean;
}

interface Pointer {
  category: string;
  id: string;
  title: string;
  url: string;
}

export interface LogContributor {
  id: string;
  fullName: string;
  givenName: string;
  middleNames: string;
  familyName: string;
  unregisteredName: string | null;
  active: boolean;
}
