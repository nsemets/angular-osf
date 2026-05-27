import { BrandModel } from '../brand/brand.model';
import { BaseProviderModel } from '../provider/provider.model';

export interface CollectionProvider extends BaseProviderModel {
  assets: CollectionProviderAssets;
  primaryCollection: CollectionProviderPrimaryCollection;
  brand: BrandModel | null;
  defaultLicenseId?: string | null;
}

interface CollectionProviderAssets {
  style?: string;
  squareColorTransparent?: string;
  squareColorNoTransparent?: string;
  favicon?: string;
}

interface CollectionProviderPrimaryCollection {
  id: string;
  type: string;
}
