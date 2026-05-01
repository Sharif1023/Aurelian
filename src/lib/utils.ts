import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PUBLIC_TOP_LEVEL_ROUTES = new Set([
  'collection',
  'product',
  'cart',
  'wishlist',
  'checkout',
  'signin',
  'track-order',
  'contact'
]);

const ADMIN_CHILD_ROUTES = new Set([
  'products',
  'orders',
  'customers',
  'marketing',
  'settings'
]);

export function normalizeAdminPath(value?: unknown): string {
  let path = '';

  if (typeof value === 'string') {
    path = value;
  } else if (
    value &&
    typeof value === 'object' &&
    'path' in value &&
    typeof (value as Record<string, unknown>).path === 'string'
  ) {
    path = (value as Record<string, string>).path;
  }

  const normalized = path.trim().replace(/^\/|\/+$/g, '').toLowerCase();
  return normalized || 'admin';
}

export function getAdminPathFromLocation(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const candidate = normalizeAdminPath(segments[0]);

  if (!candidate || candidate === 'admin') {
    return 'admin';
  }

  if (PUBLIC_TOP_LEVEL_ROUTES.has(candidate)) {
    return 'admin';
  }

  if (segments.length > 1 && ADMIN_CHILD_ROUTES.has(segments[1])) {
    return candidate;
  }

  return candidate;
}

export function getAdminPath(pathname: string): string {
  if (typeof window === 'undefined') {
    return getAdminPathFromLocation(pathname);
  }

  const stored = normalizeAdminPath(window.localStorage.getItem('admin_path') || '');
  return stored || getAdminPathFromLocation(pathname);
}
