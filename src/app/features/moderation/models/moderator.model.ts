import { Education, Employment } from '@osf/shared/models';

import { ModeratorPermission } from '../enums';

export interface Moderator {
  id: string;
  userId: string;
  fullName: string;
  permission: ModeratorPermission;
  employment: Employment[];
  education: Education[];
}
