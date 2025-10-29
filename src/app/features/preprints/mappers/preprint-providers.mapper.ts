import {
  PreprintProviderDetails,
  PreprintProviderDetailsJsonApi,
  PreprintProviderShortInfo,
} from '@osf/features/preprints/models';
import { SubjectDataJsonApi, SubjectModel } from '@osf/shared/models';
import { BrandDataJsonApi, BrandModel } from '@osf/shared/models/brand';

export class PreprintProvidersMapper {
  static fromPreprintProviderDetailsGetResponse(response: PreprintProviderDetailsJsonApi): PreprintProviderDetails {
    const brandRaw = response.embeds!.brand?.data;
    return {
      id: response.id,
      name: response.attributes.name,
      descriptionHtml: response.attributes.description,
      advisoryBoardHtml: response.attributes.advisory_board,
      examplePreprintId: response.attributes.example,
      domain: response.attributes.domain,
      footerLinksHtml: response.attributes.footer_links,
      preprintWord: response.attributes.preprint_word,
      allowSubmissions: response.attributes.allow_submissions,
      assertionsEnabled: response.attributes.assertions_enabled,
      permissions: response.attributes.permissions,
      brand: PreprintProvidersMapper.parseBrand(brandRaw),
      iri: response.links.iri,
      faviconUrl: response.attributes.assets?.favicon,
      squareColorNoTransparentImageUrl: response.attributes.assets?.square_color_no_transparent,
      reviewsWorkflow: response.attributes.reviews_workflow,
      facebookAppId: response.attributes.facebook_app_id,
      reviewsCommentsPrivate: response.attributes.reviews_comments_private,
      reviewsCommentsAnonymous: response.attributes.reviews_comments_anonymous,
    };
  }

  static parseBrand(brandRaw: BrandDataJsonApi): BrandModel {
    if (!brandRaw) {
      return {
        primaryColor: 'var(--osf-provider-primary-color)',
        secondaryColor: 'var(--osf-provider-secondary-color)',
      } as BrandModel;
    }

    return {
      id: brandRaw.id,
      name: brandRaw.attributes.name,
      heroLogoImageUrl: brandRaw.attributes.hero_logo_image,
      heroBackgroundImageUrl: brandRaw.attributes.hero_background_image,
      topNavLogoImageUrl: brandRaw.attributes.topnav_logo_image,
      primaryColor: brandRaw.attributes.primary_color,
      secondaryColor: brandRaw.attributes.secondary_color,
      backgroundColor: brandRaw.attributes.background_color,
    };
  }

  static toPreprintProviderShortInfoFromGetResponse(
    response: PreprintProviderDetailsJsonApi[]
  ): PreprintProviderShortInfo[] {
    return response.map((item) => ({
      id: item.id,
      descriptionHtml: item.attributes.description,
      name: item.attributes.name,
      whiteWideImageUrl: item.attributes.assets?.wide_white,
      squareColorNoTransparentImageUrl: item.attributes.assets?.square_color_no_transparent,
    }));
  }

  static fromSubjectsGetResponse(data: SubjectDataJsonApi[]): SubjectModel[] {
    return data.map((subject) => ({
      id: subject.id,
      name: subject.attributes.text,
      iri: subject.links.iri,
    }));
  }
}
