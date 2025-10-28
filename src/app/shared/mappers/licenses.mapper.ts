import { LicenseDataJsonApi, LicenseModel, LicensesResponseJsonApi } from '../models';

export class LicensesMapper {
  static fromLicensesResponse(response: LicensesResponseJsonApi): LicenseModel[] {
    if (!response.data) {
      return [];
    }

    return response.data.map((item) => LicensesMapper.fromLicenseDataJsonApi(item)).filter((item) => !!item);
  }

  static fromLicenseDataJsonApi(data: LicenseDataJsonApi): LicenseModel | null {
    if (!data) {
      return null;
    }

    return {
      id: data?.id,
      name: data?.attributes?.name,
      requiredFields: data?.attributes?.required_fields,
      url: data?.attributes?.url,
      text: data?.attributes?.text,
    };
  }
}
