/**
 * Mapping of web application routes to their required permissions.
 * These permission strings should match the permissions defined in the API and Database Seed.
 */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/administration': 'read:users',
  '/administration/users': 'read:users',
  '/administration/roles': 'read:roles',
  '/inventory/items': 'read:items',
  '/inventory/warehouses': 'read:warehouses',
  '/inventory/stock': 'read:stock',
  '/purchasing/purchase-orders': 'read:purchase-orders',
  '/purchasing/goods-receipts': 'read:goods-receipts',
  '/purchasing/suppliers': 'read:partners',
  '/purchasing/products': 'read:items',
  '/sales/sales-orders': 'read:sales-orders',
  '/sales/delivery-notes': 'read:delivery-notes',
  '/sales/invoices': 'read:invoices',
  '/sales/customers': 'read:partners',
  '/sales/products': 'read:items',
  '/partners': 'read:partners',
};
