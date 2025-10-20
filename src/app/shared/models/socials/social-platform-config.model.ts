import { SocialShareLinksModel } from './social-share-links.model';

export interface SocialPlatformConfig {
  label: string;
  icon: string;
  urlKey: keyof SocialShareLinksModel;
}
