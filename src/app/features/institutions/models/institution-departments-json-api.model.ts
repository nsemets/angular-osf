export interface InstitutionDepartmentAttributes {
  name: string;
  number_of_users: number;
}

export interface InstitutionDepartmentLinks {
  self: string;
}

export interface InstitutionDepartmentDataJsonAPi {
  id: string;
  type: 'institution-departments';
  attributes: InstitutionDepartmentAttributes;
  links: InstitutionDepartmentLinks;
}

export interface InstitutionDepartmentsJsonApi {
  data: InstitutionDepartmentDataJsonAPi[];
}
