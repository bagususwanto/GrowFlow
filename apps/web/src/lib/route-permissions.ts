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
  '/logistics/goods-receipts': 'read:goods-receipts',
  '/purchasing/suppliers': 'read:partners',
  '/purchasing/products': 'read:items',
  '/sales/sales-orders': 'read:sales-orders',
  '/logistics/delivery-notes': 'read:delivery-notes',
  '/sales/invoices': 'read:invoices',
  '/sales/customers': 'read:partners',
  '/sales/products': 'read:items',
  '/partners': 'read:partners',
  // Phase 5 Accounting & Purchase Invoices
  '/purchasing/vendor-invoices': 'read:invoices',
  '/accounting/chart-of-accounts': 'read:accounting',
  '/accounting/journal-entries': 'read:accounting',
  '/accounting/reports/trial-balance': 'read:accounting',
  '/accounting/reports/profit-loss': 'read:accounting',
  '/accounting/reports/ap-aging': 'read:accounting',
  '/accounting/reports/ar-aging': 'read:accounting',
  '/accounting/settings': 'read:accounting',
};
