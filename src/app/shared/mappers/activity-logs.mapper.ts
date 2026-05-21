import { replaceBadEncodedChars } from '@shared/helpers/format-bad-encoding.helper';

import { DEFAULT_TABLE_PARAMS } from '../constants/default-table-params.constants';
import { ActivityLog, LogContributor } from '../models/activity-logs/activity-logs.model';
import { ActivityLogJsonApi, LogContributorJsonApi } from '../models/activity-logs/activity-logs-json-api.model';
import { ResponseJsonApi } from '../models/common/json-api.model';
import { PaginatedData } from '../models/paginated-data.model';

import { BaseNodeMapper } from './nodes';
import { UserMapper } from './user';

export class ActivityLogsMapper {
  static fromActivityLogJsonApi(log: ActivityLogJsonApi, isAnonymous?: boolean): ActivityLog {
    const params = log.attributes.params ?? {};
    const contributors = params.contributors ?? [];

    return {
      id: log.id,
      type: log.type,
      action: log.attributes.action,
      date: log.attributes.date,
      params: {
        contributors: contributors.length
          ? contributors.map((contributor) => this.fromContributorJsonApi(contributor))
          : [],
        license: params.license,
        tag: params.tag,
        institution: params.institution,
        paramsNode: params.params_node
          ? {
              id: params.params_node.id,
              title: replaceBadEncodedChars(params.params_node.title),
            }
          : { id: '', title: '' },
        paramsProject: params.params_project,
        template_node: params.template_node
          ? {
              id: params.template_node.id,
              url: params.template_node.url,
              title: replaceBadEncodedChars(params.template_node.title),
            }
          : null,
        pointer: params.pointer
          ? {
              category: params.pointer.category,
              id: params.pointer.id,
              title: replaceBadEncodedChars(params.pointer.title),
              url: params.pointer.url,
            }
          : null,
        preprintProvider: params.preprint_provider,
        addon: params.addon,
        anonymousLink: params.anonymous_link,
        file: params.file,
        wiki: params.wiki,
        destination: params.destination,
        identifiers: params.identifiers,
        kind: params.kind,
        oldPage: params.old_page,
        page: params.page,
        pageId: params.page_id,
        path: params.path,
        urls: params.urls,
        preprint: params.preprint,
        source: params.source,
        titleNew: params.title_new,
        titleOriginal: params.title_original,
        updatedFields: params.updated_fields,
        value: params.value,
        version: params.version,
        githubUser: params.github_user,
      },
      isAnonymous,
      embeds: log.embeds
        ? {
            originalNode: log.embeds.original_node?.data
              ? BaseNodeMapper.getNodeData(log.embeds.original_node.data)
              : undefined,
            user: log.embeds.user?.data ? UserMapper.fromUserGetResponse(log.embeds.user.data) : undefined,
            linkedNode: log.embeds.linked_node?.data
              ? BaseNodeMapper.getNodeData(log.embeds.linked_node.data)
              : undefined,
          }
        : undefined,
    };
  }

  static fromGetActivityLogsResponse(logs: ResponseJsonApi<ActivityLogJsonApi[]>): PaginatedData<ActivityLog[]> {
    const isAnonymous = logs.meta.anonymous ?? false;
    return {
      data: logs.data.map((log) => this.fromActivityLogJsonApi(log, isAnonymous)),
      totalCount: logs.meta.total ?? 0,
      pageSize: logs.meta.per_page ?? DEFAULT_TABLE_PARAMS.rows,
      isAnonymous,
    };
  }

  private static fromContributorJsonApi(contributor: LogContributorJsonApi): LogContributor {
    return {
      id: contributor.id,
      fullName: contributor.full_name,
      givenName: contributor.given_name,
      middleNames: contributor.middle_names,
      familyName: contributor.family_name,
      unregisteredName: contributor.unregistered_name,
      active: contributor.active,
    };
  }
}
