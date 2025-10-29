import { AsyncStateWithTotalCount } from '@osf/shared/models';
import { ActivityLogWithDisplay } from '@osf/shared/models/activity-logs';

export interface ActivityLogsStateModel {
  activityLogs: AsyncStateWithTotalCount<ActivityLogWithDisplay[]>;
}

export const ACTIVITY_LOGS_STATE_DEFAULT: ActivityLogsStateModel = {
  activityLogs: {
    data: [],
    isLoading: false,
    error: null,
    totalCount: 0,
  },
};
