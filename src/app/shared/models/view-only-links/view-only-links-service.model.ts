import { Observable } from 'rxjs';

import { NodeResponseModel } from '../node-response.model';

import { PaginatedViewOnlyLinksModel } from './view-only-link.model';
import { ViewOnlyLinkJsonApi } from './view-only-link-response.model';

export interface IViewOnlyLinksService {
  getResourceById(projectId: string): Observable<NodeResponseModel>;
  getViewOnlyLinksData(projectId: string): Observable<PaginatedViewOnlyLinksModel>;
  createViewOnlyLink(projectId: string, payload: ViewOnlyLinkJsonApi): Observable<PaginatedViewOnlyLinksModel>;
  deleteLink(projectId: string, linkId: string): Observable<void>;
}
