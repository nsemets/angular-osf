export enum ReviewActionTrigger {
  Submit = 'submit', // registration submitted by admins
  AcceptSubmission = 'accept_submission', // accept submission
  RejectSubmission = 'reject_submission', // reject submission
  ForceWithdraw = 'force_withdraw', // force withdraw without request
  RequestWithdrawal = 'request_withdrawal', // request to withdraw by contributors
  AcceptWithdrawal = 'accept_withdrawal', // accept withdrawal request
  RejectWithdrawal = 'reject_withdrawal', // deny withdrawal request
  RequestEmbargoTermination = 'request_embargo_termination', // admin requests embargo termination
}

export enum SchemaResponseActionTrigger {
  SubmitRevision = 'submit',
  AdminApproveRevision = 'approve',
  AdminRejectRevision = 'admin_reject',
  AcceptRevision = 'accept',
  RejectRevision = 'moderator_reject',
}
