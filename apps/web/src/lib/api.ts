import type {
  AuthResponse,
  CartLine,
  CartTotals,
  CatalogFacets,
  Category,
  Paginated,
  Product,
  ProductQuery,
  PublicUser,
} from '@oneset/types';
import {
  mockFacets,
  mockFindProduct,
  mockFindProducts,
  mockRelated,
  MOCK_CATEGORIES,
  MOCK_SETUPS,
  type SetupPresetSummary,
} from './mock-data';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/* -------------------------------------------------------------------------- */
/* Sample-data mode                                                            */
/* -------------------------------------------------------------------------- */

let sampleMode = !API_URL;
const sampleListeners = new Set<() => void>();

function enterSampleMode() {
  if (sampleMode) return;
  sampleMode = true;
  sampleListeners.forEach((listener) => listener());
}

export const sampleModeStore = {
  subscribe(listener: () => void) {
    sampleListeners.add(listener);
    return () => sampleListeners.delete(listener);
  },
  get: () => sampleMode,
  getServerSnapshot: () => false,
};

/* -------------------------------------------------------------------------- */
/* Auth plumbing — the auth store registers these on import                    */
/* -------------------------------------------------------------------------- */

let getAccessToken: () => string | null = () => null;
let refreshSession: () => Promise<string | null> = async () => null;

export function registerAuthBridge(bridge: {
  getAccessToken: () => string | null;
  refreshSession: () => Promise<string | null>;
}) {
  getAccessToken = bridge.getAccessToken;
  refreshSession = bridge.refreshSession;
}

/* -------------------------------------------------------------------------- */
/* Core request                                                                */
/* -------------------------------------------------------------------------- */

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  /** Set false to bubble a 401 instead of trying a refresh. */
  retryOnUnauthorized?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiError('The API is not connected. Set NEXT_PUBLIC_API_URL to enable this.', 0);
  }

  const { body, auth, retryOnUnauthorized = true, headers, ...rest } = options;
  const token = auth ? getAccessToken() : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const fresh = await refreshSession();
    if (fresh) return request<T>(path, { ...options, retryOnUnauthorized: false });
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = Array.isArray(payload?.message)
      ? payload.message.join(' ')
      : (payload?.message ?? 'Something went wrong. Try again.');
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Network failures (or no API at all) fall back to the bundled sample catalog. */
async function withFallback<T>(live: () => Promise<T>, sample: () => T): Promise<T> {
  if (!API_URL) return sample();
  try {
    return await live();
  } catch (error) {
    if (error instanceof ApiError && error.status > 0) throw error;
    enterSampleMode();
    return sample();
  }
}

function toSearchParams(query: ProductQuery & { featured?: boolean } = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/* -------------------------------------------------------------------------- */
/* Catalog                                                                     */
/* -------------------------------------------------------------------------- */

export const catalogApi = {
  products: (query: ProductQuery & { featured?: boolean } = {}) =>
    withFallback<Paginated<Product>>(
      () => request(`/products${toSearchParams(query)}`),
      () => mockFindProducts(query),
    ),

  facets: (query: ProductQuery = {}) =>
    withFallback<CatalogFacets>(
      () => request(`/products/facets${toSearchParams(query)}`),
      () => mockFacets(query),
    ),

  product: (slug: string) =>
    withFallback<Product>(
      () => request(`/products/${slug}`),
      () => mockFindProduct(slug),
    ),

  related: (slug: string) =>
    withFallback<Product[]>(
      () => request(`/products/${slug}/related`),
      () => mockRelated(slug),
    ),

  categories: () =>
    withFallback<Category[]>(
      () => request('/categories'),
      () => MOCK_CATEGORIES,
    ),

  category: (slug: string) =>
    withFallback<Category>(
      () => request(`/categories/${slug}`),
      () => {
        const found = MOCK_CATEGORIES.find((c) => c.slug === slug);
        if (!found) throw new ApiError('Category not found.', 404);
        return found;
      },
    ),

  setups: () =>
    withFallback<SetupPresetSummary[]>(
      () => request('/setups'),
      () => MOCK_SETUPS,
    ),
};

/* -------------------------------------------------------------------------- */
/* Auth                                                                        */
/* -------------------------------------------------------------------------- */

export const authApi = {
  register: (body: { email: string; password: string; firstName: string; lastName: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body }),
  refresh: (refreshToken: string) =>
    request<AuthResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } }),
  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST', auth: true }),
  me: () => request<PublicUser>('/auth/me', { auth: true }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email } }),
};

/* -------------------------------------------------------------------------- */
/* Cart + wishlist (server side of Sprint 5)                                   */
/* -------------------------------------------------------------------------- */

export interface ServerCart {
  id: string;
  lines: (CartLine & { id: string })[];
  totals: CartTotals;
}

export const cartApi = {
  get: () => request<ServerCart>('/cart', { auth: true }),
  add: (body: { productId: string; variantId?: string | null; quantity?: number }) =>
    request<ServerCart>('/cart/items', { method: 'POST', body, auth: true }),
  update: (itemId: string, quantity: number) =>
    request<ServerCart>(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity }, auth: true }),
  remove: (itemId: string) =>
    request<ServerCart>(`/cart/items/${itemId}`, { method: 'DELETE', auth: true }),
  clear: () => request<ServerCart>('/cart', { method: 'DELETE', auth: true }),
  merge: (items: { productId: string; variantId?: string | null; quantity?: number }[]) =>
    request<ServerCart>('/cart/merge', { method: 'POST', body: { items }, auth: true }),
};

export const wishlistApi = {
  list: () => request<Product[]>('/wishlist', { auth: true }),
  toggle: (productId: string) =>
    request<Product[]>('/wishlist/toggle', { method: 'POST', body: { productId }, auth: true }),
  remove: (productId: string) =>
    request<Product[]>(`/wishlist/${productId}`, { method: 'DELETE', auth: true }),
};

/* -------------------------------------------------------------------------- */
/* Addresses + orders (Sprint 6)                                               */
/* -------------------------------------------------------------------------- */

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  governorate: string;
  postalCode: string;
  isDefault: boolean;
}

export interface AddressInput {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  governorate: string;
  postalCode: string;
  isDefault?: boolean;
}

export const addressApi = {
  list: () => request<Address[]>('/addresses', { auth: true }),
  create: (body: AddressInput) => request<Address>('/addresses', { method: 'POST', body, auth: true }),
  update: (id: string, body: Partial<AddressInput>) =>
    request<Address>(`/addresses/${id}`, { method: 'PATCH', body, auth: true }),
  remove: (id: string) => request<{ success: boolean }>(`/addresses/${id}`, { method: 'DELETE', auth: true }),
};

export interface OrderItem {
  id: string;
  name: string;
  optionLabel?: string | null;
  unitPriceMillimes: number;
  quantity: number;
}

export interface Order {
  id: string;
  reference: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  couponCode?: string | null;
  createdAt: string;
  items: OrderItem[];
  address?: Address | null;
  payment?: { status: string; provider: string } | null;
  user?: { firstName: string; lastName: string; email: string } | null;
}

export interface CheckoutResponse {
  order: Order;
  clientSecret: string;
  stub: boolean;
}

export const ordersApi = {
  checkout: (body: { addressId?: string; address?: AddressInput; couponCode?: string }) =>
    request<CheckoutResponse>('/orders/checkout', { method: 'POST', body, auth: true }),
  confirmStubPayment: (orderId: string) =>
    request<Order>(`/orders/${orderId}/confirm-stub-payment`, { method: 'POST', auth: true }),
  mine: () => request<Order[]>('/orders/mine', { auth: true }),
  get: (orderId: string) => request<Order>(`/orders/${orderId}`, { auth: true }),
  allAdmin: (query: { status?: string; search?: string; page?: number; pageSize?: number } = {}) => {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.search) params.set('search', query.search);
    if (query.page) params.set('page', String(query.page));
    if (query.pageSize) params.set('pageSize', String(query.pageSize));
    const qs = params.toString();
    return request<{ items: Order[]; total: number; page: number; pageSize: number; pageCount: number }>(
      `/orders${qs ? `?${qs}` : ''}`,
      { auth: true },
    );
  },
  updateStatus: (orderId: string, status: Order['status']) =>
    request<Order>(`/orders/${orderId}/status`, { method: 'PATCH', body: { status }, auth: true }),
};

/* -------------------------------------------------------------------------- */
/* Reviews (Sprint 7)                                                          */
/* -------------------------------------------------------------------------- */

export interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

export interface ReviewStatus {
  canReview: boolean;
  alreadyReviewed: boolean;
}

export const reviewsApi = {
  list: (slug: string) => request<Review[]>(`/products/${slug}/reviews`),
  mine: (slug: string) => request<ReviewStatus>(`/products/${slug}/reviews/mine`, { auth: true }),
  create: (slug: string, body: { rating: number; title?: string; body: string }) =>
    request<Review>(`/products/${slug}/reviews`, { method: 'POST', body, auth: true }),
};

/* -------------------------------------------------------------------------- */
/* Admin (Sprint 8)                                                            */
/* -------------------------------------------------------------------------- */

export interface AdminStats {
  revenueMillimes: number;
  totalOrders: number;
  customerCount: number;
  lowStock: { id: string; name: string; slug: string; brand: string; stock: number }[];
  topProducts: { id: string; name: string; slug: string; priceMillimes: number; unitsSold: number }[];
}

export const adminApi = {
  stats: () => request<AdminStats>('/admin/stats', { auth: true }),
};

export interface ProductImageInput {
  url: string;
  alt: string;
  position?: number;
}

export interface ProductVariantInput {
  name: string;
  sku: string;
  optionName: string;
  optionValue: string;
  swatchHex?: string;
  priceMillimes: number;
  stock: number;
}

export interface ProductSpecInput {
  group: string;
  label: string;
  value: string;
  position?: number;
}

export interface ProductInput {
  name: string;
  slug?: string;
  brand: string;
  shortDescription: string;
  description: string;
  priceMillimes: number;
  compareAtMillimes?: number | null;
  stock: number;
  categoryId: string;
  tags?: string[];
  isFeatured?: boolean;
  images?: ProductImageInput[];
  variants?: ProductVariantInput[];
  specifications?: ProductSpecInput[];
}

export const adminProductsApi = {
  create: (body: ProductInput) => request<Product>('/products', { method: 'POST', body, auth: true }),
  update: (id: string, body: Partial<ProductInput>) =>
    request<Product>(`/products/${id}`, { method: 'PATCH', body, auth: true }),
  remove: (id: string) => request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE', auth: true }),
};

export interface CategoryInput {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  position?: number;
}

export const adminCategoriesApi = {
  create: (body: CategoryInput) => request<Category>('/categories', { method: 'POST', body, auth: true }),
  update: (id: string, body: Partial<CategoryInput>) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body, auth: true }),
  remove: (id: string) => request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE', auth: true }),
};

/* -------------------------------------------------------------------------- */
/* Setup builder (Sprint 9)                                                    */
/* -------------------------------------------------------------------------- */

export type BuilderStyle = 'PERFORMANCE' | 'BALANCED' | 'AESTHETIC';

export interface BuilderRole {
  role: string;
  categorySlug: string;
  weightPercent: number;
  budgetShareMillimes: number;
  product: Product;
}

export interface BuilderResult {
  style: BuilderStyle;
  budgetMillimes: number;
  roles: BuilderRole[];
  totalMillimes: number;
  remainingMillimes: number;
  onSaleCount: number;
}

export const builderApi = {
  build: (body: { budgetMillimes: number; style: BuilderStyle }) =>
    request<BuilderResult>('/setup-builder', { method: 'POST', body }),
};

/* -------------------------------------------------------------------------- */
/* Compatibility engine (Sprint 10)                                            */
/* -------------------------------------------------------------------------- */

export interface CompatibilityRule {
  id: string;
  name: string;
  sourceCategory: string;
  targetCategory: string;
  sourceSpec: string;
  targetSpec: string;
  operator: string;
  message: string;
  severity: string;
}

export interface CompatibilityResult {
  rule: string;
  message: string;
  severity: string;
  sourceProduct: { id: string; name: string };
  targetProduct: { id: string; name: string };
  sourceValue: string;
  targetValue: string;
  passed: boolean;
}

export interface CompatibilityChecklistEntry {
  productId: string;
  productName: string;
  categoryName: string;
  ok: boolean;
  issues: string[];
}

export interface CompatibilityReport {
  results: CompatibilityResult[];
  errorCount: number;
  warningCount: number;
  ok: boolean;
  checklist: CompatibilityChecklistEntry[];
}

export const compatibilityApi = {
  rules: () => request<CompatibilityRule[]>('/compatibility/rules'),
  check: (productIds: string[]) =>
    request<CompatibilityReport>('/compatibility/check', { method: 'POST', body: { productIds } }),
};

export type { SetupPresetSummary };
