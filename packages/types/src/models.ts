export type Role = 'CUSTOMER' | 'ADMIN';

export type SetupStyle = 'PERFORMANCE' | 'BALANCED' | 'AESTHETIC';

export interface Category {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  position: number;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

export interface ProductSpecification {
  id: string;
  group: string;
  label: string;
  value: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  optionName: string;
  optionValue: string;
  priceMillimes: number;
  stock: number;
  swatchHex?: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  shortDescription: string;
  description: string;
  priceMillimes: number;
  compareAtMillimes?: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  isFeatured: boolean;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  createdAt?: string;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: PublicUser;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ProductQuery {
  q?: string;
  category?: string;
  categories?: string[];
  brands?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
  page?: number;
  pageSize?: number;
}

export interface CatalogFacets {
  brands: { value: string; count: number }[];
  tags: { value: string; count: number }[];
  priceRange: { min: number; max: number };
}

export interface CartLine {
  productId: string;
  variantId?: string | null;
  slug: string;
  name: string;
  brand: string;
  optionLabel?: string | null;
  unitPriceMillimes: number;
  compareAtMillimes?: number | null;
  quantity: number;
  stock: number;
  image?: string | null;
  categorySlug: string;
}

export interface WishlistEntry {
  productId: string;
  addedAt: string;
}
