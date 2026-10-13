import type { PublicCategory, PublicProduct, PublicSort, SkinType } from '@mc/shared';

export type { Category, SkinType, ProductShape as ArtShape, Variant } from '@mc/shared';

export type Product = PublicProduct;
export type CategoryWithCount = PublicCategory;
export type SortKey = PublicSort;

export interface ProductFilters {
  category?: string;
  q?: string;
  min?: number;
  max?: number;
  skin?: SkinType[];
  sale?: boolean;
  sort?: SortKey;
  tag?: string;
  limit?: number;
}
