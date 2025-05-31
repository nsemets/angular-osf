export interface ContributorModel {
  id: string;
  userId: string;
  type: string;
  isBibliographic: boolean;
  isCurator: boolean;
  permission: string;
  fullName: string;
}
