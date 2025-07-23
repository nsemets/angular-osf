import { RegistryStatus } from '@osf/shared/enums';
import { StatusInfo } from '@osf/shared/models';

export const RegistryStatusMap: Record<RegistryStatus, StatusInfo> = {
  [RegistryStatus.None]: { label: '', severity: null },
  [RegistryStatus.PendingRegistrationApproval]: { label: 'Pending registration approval', severity: 'warn' },
  [RegistryStatus.PendingEmbargoApproval]: { label: 'Pending embargo approval', severity: 'warn' },
  [RegistryStatus.Pending]: { label: 'Pending', severity: 'info' },
  [RegistryStatus.Accepted]: { label: 'Accepted', severity: 'success' },
  [RegistryStatus.Embargo]: { label: 'Embargo', severity: 'info' },
  [RegistryStatus.PendingEmbargoTerminationApproval]: {
    label: 'Pending embargo termination approval',
    severity: 'warn',
  },
  [RegistryStatus.PendingWithdrawRequest]: { label: 'Pending withdraw request', severity: 'info' },
  [RegistryStatus.PendingWithdraw]: { label: 'Pending withdrawal', severity: 'warn' },
  [RegistryStatus.Unapproved]: { label: 'Unapproved', severity: 'danger' },
  [RegistryStatus.InProgress]: { label: 'In progress', severity: 'info' },
  [RegistryStatus.PendingModeration]: { label: 'Pending moderation', severity: 'warn' },
};
