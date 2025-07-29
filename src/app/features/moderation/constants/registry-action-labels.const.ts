import { RegistryActionState } from '../enums';

export const REGISTRY_ACTION_LABEL: Record<RegistryActionState | string, string> = {
  [RegistryActionState.Accepted]: 'moderation.registryAccepted',
  [RegistryActionState.Pending]: 'moderation.registrySubmitted',
  [RegistryActionState.PendingWithdraw]: 'moderation.registryWithdrawalRequested',
  [RegistryActionState.Withdrawn]: 'moderation.registryWithdrawalAccepted',
  [RegistryActionState.Rejected]: 'moderation.registryRejected',
};
