export interface ContributorAddRequestModel {
  attributes: {
    bibliographic: boolean;
    child_nodes?: string[];
    email?: string;
    full_name?: string;
    id?: string;
    index?: number;
    permission: string;
  };
  id?: string;
  relationships?: {
    users?: {
      data?: ContributorAddRequestUsersDataJsonApi;
    };
  };
  type: 'contributors';
}

interface ContributorAddRequestUsersDataJsonApi {
  id?: string;
  type: 'users';
}
