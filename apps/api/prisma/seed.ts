import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Start seeding...');

  // ─────────────────────────────────────────────
  // 1. Roles
  //
  // Permissions below are descriptive metadata that reflect
  // the actual access control enforced via @Roles() decorators
  // in each controller. Format: "action:resource:sub-action?"
  // ─────────────────────────────────────────────
  const rolesData = [
    {
      name: 'superadmin',
      // Full access to all resources and actions
      permissions: ['*'],
    },
    {
      name: 'manager',
      permissions: [
        'read:dashboard',
        'read:users',
        'read:roles',
        'create:warehouses', 'read:warehouses', 'update:warehouses',
        'create:category-items', 'read:category-items', 'update:category-items', 'delete:category-items',
        'create:items', 'read:items', 'update:items', 'delete:items',
        'create:partners', 'read:partners', 'update:partners',
        'read:stock',
        'read:purchase-orders', 'approve:purchase-orders', 'cancel:purchase-orders',
        'read:goods-receipts',
        'read:sales-orders', 'confirm:sales-orders', 'cancel:sales-orders', 'delete:sales-orders',
        'read:delivery-notes',
        'read:invoices',
        'read:accounting',
      ],
    },
    {
      name: 'sales',
      permissions: [
        'read:dashboard',
        'read:warehouses',
        'read:category-items',
        'read:items',
        'read:partners',
        'read:stock',
        'create:sales-orders', 'read:sales-orders', 'update:sales-orders',
        'read:invoices',
      ],
    },
    {
      name: 'purchasing',
      permissions: [
        'read:dashboard',
        'read:warehouses',
        'read:category-items',
        'read:items',
        'read:partners',
        'read:stock',
        'create:purchase-orders', 'read:purchase-orders', 'update:purchase-orders', 'submit:purchase-orders',
        'read:goods-receipts',
        'read:invoices',
      ],
    },
    {
      name: 'finance',
      permissions: [
        'read:dashboard',
        'read:partners',
        'read:items',
        'read:stock',
        'read:purchase-orders',
        'read:goods-receipts',
        'read:sales-orders',
        'read:delivery-notes',
        'read:invoices', 'create:invoices', 'update:invoices',
        'read:accounting', 'create:accounting', 'update:accounting', 'delete:accounting',
      ],
    },
    {
      name: 'warehouse',
      permissions: [
        'read:dashboard',
        'read:warehouses',
        'read:category-items',
        'read:items',
        'read:stock', 'write:stock',
        'create:goods-receipts', 'read:goods-receipts', 'update:goods-receipts', 'confirm:goods-receipts',
        'create:delivery-notes', 'read:delivery-notes', 'update:delivery-notes', 'confirm:delivery-notes',
      ],
    },
  ];


  const roles: { id: string; name: string }[] = [];
  for (const role of rolesData) {
    const upsertedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {
        permissions: JSON.stringify(role.permissions),
      },
      create: {
        name: role.name,
        permissions: JSON.stringify(role.permissions),
      },
    });
    roles.push(upsertedRole);
    console.info(`  ✔ Role: ${role.name}`);
  }

  // ─────────────────────────────────────────────
  // 2. Users
  // ─────────────────────────────────────────────
  const superadminRole = roles.find((r) => r.name === 'superadmin')!;
  const managerRole = roles.find((r) => r.name === 'manager')!;
  const warehouseRole = roles.find((r) => r.name === 'warehouse')!;
  const financeRole = roles.find((r) => r.name === 'finance')!;
  const salesRole = roles.find((r) => r.name === 'sales')!;
  const purchasingRole = roles.find((r) => r.name === 'purchasing')!;

  if (!superadminRole) {
    throw new Error('Superadmin role was not created successfully.');
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@growflow.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@growflow.com',
      passwordHash,
      roleId: superadminRole.id,
      isActive: true,
    },
  });
  console.info(`  ✔ User: ${superadmin.email} (superadmin)`);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@growflow.com' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'manager@growflow.com',
      passwordHash,
      roleId: managerRole.id,
      isActive: true,
    },
  });
  console.info(`  ✔ User: ${manager.email} (manager)`);

  const warehouseStaff = await prisma.user.upsert({
    where: { email: 'warehouse@growflow.com' },
    update: {},
    create: {
      name: 'Siti Rahayu',
      email: 'warehouse@growflow.com',
      passwordHash,
      roleId: warehouseRole.id,
      isActive: true,
    },
  });
  console.info(`  ✔ User: ${warehouseStaff.email} (warehouse)`);

  const financeStaff = await prisma.user.upsert({
    where: { email: 'finance@growflow.com' },
    update: {},
    create: {
      name: 'Finance User',
      email: 'finance@growflow.com',
      passwordHash,
      roleId: financeRole.id,
      isActive: true,
    },
  });
  console.info(`  ✔ User: ${financeStaff.email} (finance)`);

  const salesStaff = await prisma.user.upsert({
    where: { email: 'sales@growflow.com' },
    update: {},
    create: {
      name: 'Sales Staff',
      email: 'sales@growflow.com',
      passwordHash,
      roleId: salesRole.id,
      isActive: true,
    },
  });
  console.info(`  ✔ User: ${salesStaff.email} (sales)`);

  const purchasingStaff = await prisma.user.upsert({
    where: { email: 'purchasing@growflow.com' },
    update: {},
    create: {
      name: 'Purchasing Staff',
      email: 'purchasing@growflow.com',
      passwordHash,
      roleId: purchasingRole.id,
      isActive: true,
    },
  });
  console.info(`  ✔ User: ${purchasingStaff.email} (purchasing)`);

  // ─────────────────────────────────────────────
  // 3. Warehouses
  // ─────────────────────────────────────────────
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { id: 'e9c8a2b5-55ff-4be5-9430-c3d3958c279c' },
    update: { name: 'Main Warehouse', address: 'Jl. Industri No. 12, Bekasi' },
    create: {
      id: 'e9c8a2b5-55ff-4be5-9430-c3d3958c279c',
      name: 'Main Warehouse',
      address: 'Jl. Industri No. 12, Bekasi',
      isActive: true,
    },
  });
  console.info(`  ✔ Warehouse: ${mainWarehouse.name}`);

  const branchWarehouse = await prisma.warehouse.upsert({
    where: { id: 'f3dbdf7c-50ab-48d6-9cb3-b2d9de59ee93' },
    update: { name: 'Branch Warehouse', address: 'Jl. Rungkut Industri No. 45, Surabaya' },
    create: {
      id: 'f3dbdf7c-50ab-48d6-9cb3-b2d9de59ee93',
      name: 'Branch Warehouse',
      address: 'Jl. Rungkut Industri No. 45, Surabaya',
      isActive: true,
    },
  });
  console.info(`  ✔ Warehouse: ${branchWarehouse.name}`);

  // ─────────────────────────────────────────────
  // 4. Category Items
  // ─────────────────────────────────────────────
  const categoriesData = [
    { name: 'Electronics', description: 'Electronic goods and computers' },
    { name: 'Furniture', description: 'Office furniture and fixtures' },
    { name: 'Office Supplies', description: 'Stationery and paper supplies' },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const upsertedCat = await prisma.categoryItem.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: { name: cat.name, description: cat.description },
    });
    categoriesMap[cat.name] = upsertedCat.id;
    console.info(`  ✔ Category: ${cat.name}`);
  }

  // ─────────────────────────────────────────────
  // 5. Items
  // ─────────────────────────────────────────────
  const itemsData = [
    {
      code: 'ITEM-EL-001',
      name: 'Laptop ThinkPad L14',
      unit: 'pcs',
      categoryName: 'Electronics',
      minStock: 5,
    },
    {
      code: 'ITEM-EL-002',
      name: 'Monitor LG 24"',
      unit: 'pcs',
      categoryName: 'Electronics',
      minStock: 3,
    },
    {
      code: 'ITEM-EL-003',
      name: 'Wireless Mouse Logitech M185',
      unit: 'pcs',
      categoryName: 'Electronics',
      minStock: 10,
    },
    {
      code: 'ITEM-FT-001',
      name: 'Minimalist Work Desk',
      unit: 'unit',
      categoryName: 'Furniture',
      minStock: 2,
    },
    {
      code: 'ITEM-FT-002',
      name: 'Ergonomic Office Chair',
      unit: 'unit',
      categoryName: 'Furniture',
      minStock: 2,
    },
    {
      code: 'ITEM-OS-001',
      name: 'A4 Paper 80gsm',
      unit: 'ream',
      categoryName: 'Office Supplies',
      minStock: 10,
    },
    {
      code: 'ITEM-OS-002',
      name: 'Ballpoint Pen (Box)',
      unit: 'box',
      categoryName: 'Office Supplies',
      minStock: 20,
    },
  ];

  const itemsMap: Record<string, string> = {};
  for (const item of itemsData) {
    const categoryId = categoriesMap[item.categoryName] ?? null;
    const upsertedItem = await prisma.item.upsert({
      where: { code: item.code },
      update: { name: item.name, unit: item.unit, categoryId, minStock: item.minStock },
      create: {
        code: item.code,
        name: item.name,
        unit: item.unit,
        categoryId,
        minStock: item.minStock,
      },
    });
    itemsMap[item.code] = upsertedItem.id;
    console.info(`  ✔ Item: ${item.name}`);
  }

  // ─────────────────────────────────────────────
  // 6. Partners (Suppliers & Customers)
  // ─────────────────────────────────────────────
  const partnersData = [
    {
      code: 'SUP-0001',
      name: 'PT Multi Kencana Elektronik',
      type: 'SUPPLIER' as const,
      email: 'sales@multikencana.co.id',
      phone: '021-5551234',
      address: 'Kawasan Industri Jababeka, Cikarang',
    },
    {
      code: 'SUP-0002',
      name: 'CV Rimba Abadi',
      type: 'SUPPLIER' as const,
      email: 'rimba.abadi@gmail.com',
      phone: '08123456789',
      address: 'Jl. Raya Jepara KM 7, Jepara',
    },
    {
      code: 'CUS-0001',
      name: 'PT Solusi Teknologi Nusantara',
      type: 'CUSTOMER' as const,
      email: 'procurement@solusitekno.com',
      phone: '021-8884321',
      address: 'Sudirman Central Business District, Jakarta',
    },
    {
      code: 'CUS-0002',
      name: 'Yayasan Harapan Bangsa',
      type: 'CUSTOMER' as const,
      email: 'info@harapanbangsa.or.id',
      phone: '021-7773333',
      address: 'Jl. Pemuda No. 100, Bandung',
    },
    {
      code: 'CUS-0003',
      name: 'PT Sinar Makmur Sejahtera',
      type: 'CUSTOMER' as const,
      email: 'info@sinarmakmur.com',
      phone: '021-9990000',
      address: 'Jl. Gatot Subroto No. 50, Semarang',
    },
  ];

  const partnersMap: Record<string, string> = {};
  for (const partner of partnersData) {
    const upserted = await prisma.partner.upsert({
      where: { code: partner.code },
      update: {
        name: partner.name,
        type: partner.type,
        email: partner.email,
        phone: partner.phone,
        address: partner.address,
      },
      create: {
        code: partner.code,
        name: partner.name,
        type: partner.type,
        email: partner.email,
        phone: partner.phone,
        address: partner.address,
        isActive: true,
      },
    });
    partnersMap[partner.code] = upserted.id;
    console.info(`  ✔ Partner: ${partner.name} (${partner.type})`);
  }

  // ─────────────────────────────────────────────
  // 7. Stock Balances (initial stock)
  // ─────────────────────────────────────────────
  const stockBalancesData = [
    { itemCode: 'ITEM-EL-001', warehouseId: mainWarehouse.id, qty: 15 },
    { itemCode: 'ITEM-EL-002', warehouseId: mainWarehouse.id, qty: 10 },
    { itemCode: 'ITEM-EL-003', warehouseId: mainWarehouse.id, qty: 40 },
    { itemCode: 'ITEM-FT-001', warehouseId: mainWarehouse.id, qty: 8 },
    { itemCode: 'ITEM-FT-002', warehouseId: mainWarehouse.id, qty: 6 },
    { itemCode: 'ITEM-OS-001', warehouseId: mainWarehouse.id, qty: 50 },
    { itemCode: 'ITEM-OS-002', warehouseId: mainWarehouse.id, qty: 30 },
    { itemCode: 'ITEM-EL-001', warehouseId: branchWarehouse.id, qty: 5 },
    { itemCode: 'ITEM-OS-001', warehouseId: branchWarehouse.id, qty: 20 },
  ];

  for (const balance of stockBalancesData) {
    const itemId = itemsMap[balance.itemCode];
    await prisma.stockBalance.upsert({
      where: {
        itemId_warehouseId: { itemId, warehouseId: balance.warehouseId },
      },
      update: { qty: balance.qty },
      create: { itemId, warehouseId: balance.warehouseId, qty: balance.qty },
    });
    console.info(
      `  ✔ Stock: ${balance.itemCode} @ ${balance.warehouseId === mainWarehouse.id ? 'Main' : 'Branch'} = ${balance.qty}`,
    );
  }

  // ─────────────────────────────────────────────
  // 8. Purchase Order (demo — APPROVED + GRN CONFIRMED)
  // ─────────────────────────────────────────────
  const supplierId = partnersMap['SUP-0001'];
  const laptopId = itemsMap['ITEM-EL-001'];
  const monitorId = itemsMap['ITEM-EL-002'];

  const existingPO = await prisma.purchaseOrder.findFirst({
    where: { number: 'PO-202601-0001' },
  });

  if (!existingPO) {
    const po = await prisma.purchaseOrder.create({
      data: {
        number: 'PO-202601-0001',
        supplierId,
        status: 'APPROVED',
        note: 'Demo purchase order — approved',
        totalAmount: 45000000,
        orderDate: new Date('2026-01-15'),
        createdById: superadmin.id,
        approvedById: manager.id,
        approvedAt: new Date('2026-01-16'),
        lineItems: {
          create: [
            {
              itemId: laptopId,
              qty: 5,
              unitPrice: 8000000,
              totalPrice: 40000000,
              qtyReceived: 5,
            },
            {
              itemId: monitorId,
              qty: 5,
              unitPrice: 1000000,
              totalPrice: 5000000,
              qtyReceived: 5,
            },
          ],
        },
      },
      include: { lineItems: true },
    });
    console.info(`  ✔ PurchaseOrder: ${po.number} (APPROVED)`);

    // GRN for the PO
    const grn = await prisma.goodsReceipt.create({
      data: {
        number: 'GRN-202601-0001',
        purchaseOrderId: po.id,
        warehouseId: mainWarehouse.id,
        status: 'CONFIRMED',
        receivedDate: new Date('2026-01-18'),
        note: 'Demo goods receipt — confirmed',
        createdById: warehouseStaff.id,
        lineItems: {
          create: po.lineItems.map((li) => ({
            poLineItemId: li.id,
            itemId: li.itemId,
            qty: li.qty,
          })),
        },
      },
    });
    console.info(`  ✔ GoodsReceipt: ${grn.number} (CONFIRMED)`);
  } else {
    console.info(`  ↩ PurchaseOrder PO-202601-0001 already exists, skipping.`);
  }

  // ─────────────────────────────────────────────
  // 9. Sales Order (demo — CONFIRMED + DN CONFIRMED)
  // ─────────────────────────────────────────────
  const customerId = partnersMap['CUS-0001'];

  const existingSO = await prisma.salesOrder.findFirst({
    where: { number: 'SO-202601-0001' },
  });

  if (!existingSO) {
    const so = await prisma.salesOrder.create({
      data: {
        number: 'SO-202601-0001',
        customerId,
        warehouseId: mainWarehouse.id,
        status: 'DONE',
        note: 'Demo sales order — done',
        totalAmount: 20000000,
        orderDate: new Date('2026-01-20'),
        createdById: superadmin.id,
        confirmedById: manager.id,
        confirmedAt: new Date('2026-01-21'),
        lineItems: {
          create: [
            {
              itemId: laptopId,
              qty: 2,
              unitPrice: 9500000,
              totalPrice: 19000000,
              qtyDelivered: 2,
            },
            {
              itemId: monitorId,
              qty: 1,
              unitPrice: 1000000,
              totalPrice: 1000000,
              qtyDelivered: 1,
            },
          ],
        },
      },
      include: { lineItems: true },
    });
    console.info(`  ✔ SalesOrder: ${so.number} (DONE)`);

    // Delivery Note for the SO
    const dn = await prisma.deliveryNote.create({
      data: {
        number: 'DN-202601-0001',
        salesOrderId: so.id,
        status: 'CONFIRMED',
        deliveryDate: new Date('2026-01-22'),
        note: 'Demo delivery note — confirmed',
        createdById: warehouseStaff.id,
        lineItems: {
          create: so.lineItems.map((li) => ({
            soLineItemId: li.id,
            itemId: li.itemId,
            qty: li.qty,
          })),
        },
      },
    });
    console.info(`  ✔ DeliveryNote: ${dn.number} (CONFIRMED)`);
  } else {
    console.info(`  ↩ SalesOrder SO-202601-0001 already exists, skipping.`);
  }

  // ─────────────────────────────────────────────
  // 10. Draft Purchase Order (for UI testing)
  // ─────────────────────────────────────────────
  const mouseId = itemsMap['ITEM-EL-003'];
  const paperId = itemsMap['ITEM-OS-001'];

  const existingDraftPO = await prisma.purchaseOrder.findFirst({
    where: { number: 'PO-202602-0001' },
  });

  if (!existingDraftPO) {
    const draftPO = await prisma.purchaseOrder.create({
      data: {
        number: 'PO-202602-0001',
        supplierId: partnersMap['SUP-0002'],
        status: 'DRAFT',
        note: 'Office supplies restock',
        totalAmount: 2500000,
        orderDate: new Date('2026-02-01'),
        createdById: superadmin.id,
        lineItems: {
          create: [
            {
              itemId: mouseId,
              qty: 20,
              unitPrice: 75000,
              totalPrice: 1500000,
              qtyReceived: 0,
            },
            {
              itemId: paperId,
              qty: 20,
              unitPrice: 50000,
              totalPrice: 1000000,
              qtyReceived: 0,
            },
          ],
        },
      },
    });
    console.info(`  ✔ PurchaseOrder: ${draftPO.number} (DRAFT)`);
  } else {
    console.info(`  ↩ PurchaseOrder PO-202602-0001 already exists, skipping.`);
  }

  // ─────────────────────────────────────────────
  // 11. Draft Sales Order (for UI testing)
  // ─────────────────────────────────────────────
  const chairId = itemsMap['ITEM-FT-002'];

  const existingDraftSO = await prisma.salesOrder.findFirst({
    where: { number: 'SO-202602-0001' },
  });

  if (!existingDraftSO) {
    const draftSO = await prisma.salesOrder.create({
      data: {
        number: 'SO-202602-0001',
        customerId: partnersMap['CUS-0002'],
        warehouseId: mainWarehouse.id,
        status: 'DRAFT',
        note: 'Furniture order for new office',
        totalAmount: 6000000,
        orderDate: new Date('2026-02-05'),
        createdById: superadmin.id,
        lineItems: {
          create: [
            {
              itemId: chairId,
              qty: 4,
              unitPrice: 1500000,
              totalPrice: 6000000,
              qtyDelivered: 0,
            },
          ],
        },
      },
    });
    console.info(`  ✔ SalesOrder: ${draftSO.number} (DRAFT)`);
  } else {
    console.info(`  ↩ SalesOrder SO-202602-0001 already exists, skipping.`);
  }

  // ─────────────────────────────────────────────
  // 12. Chart of Accounts (COA) & Accounting Settings
  // ─────────────────────────────────────────────
  console.info('🌱 Seeding Chart of Accounts (COA)...');
  const { coaData } = require('./coa-data');
  
  // Seed parents first (without parentCode), then children (with parentCode)
  const parents = coaData.filter((c: any) => !c.parentCode);
  const children = coaData.filter((c: any) => c.parentCode);

  const seededAccounts: Record<string, string> = {};

  for (const acc of parents) {
    const upserted = await prisma.account.upsert({
      where: { code: acc.code },
      update: {
        name: acc.name,
        type: acc.type,
        category: acc.category,
        isSystemAccount: acc.isSystemAccount ?? false,
      },
      create: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        category: acc.category,
        isSystemAccount: acc.isSystemAccount ?? false,
      },
    });
    seededAccounts[acc.code] = upserted.id;
  }

  for (const acc of children) {
    const parentId = seededAccounts[acc.parentCode];
    if (!parentId) {
      throw new Error(`Parent account not found for code ${acc.code} with parentCode ${acc.parentCode}`);
    }
    const upserted = await prisma.account.upsert({
      where: { code: acc.code },
      update: {
        name: acc.name,
        type: acc.type,
        category: acc.category,
        parentId,
        isSystemAccount: acc.isSystemAccount ?? false,
      },
      create: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        category: acc.category,
        parentId,
        isSystemAccount: acc.isSystemAccount ?? false,
      },
    });
    seededAccounts[acc.code] = upserted.id;
  }
  console.info(`  ✔ Seeded ${coaData.length} COA Accounts.`);

  // Initialize AccountingSettings with mapped default accounts
  console.info('🌱 Seeding default Accounting Settings...');
  const apAccount = await prisma.account.findUnique({ where: { code: '2-1100' } }); // Hutang Usaha (System)
  const arAccount = await prisma.account.findUnique({ where: { code: '1-1300' } }); // Piutang Usaha (System)
  const cashAccount = await prisma.account.findUnique({ where: { code: '1-1200' } }); // Bank default (System)
  const inventoryAccount = await prisma.account.findUnique({ where: { code: '1-1400' } }); // Persediaan Barang Dagang (System)
  const cogsAccount = await prisma.account.findUnique({ where: { code: '5-1000' } }); // Beban Pokok Penjualan (COGS) (System)
  const revenueAccount = await prisma.account.findUnique({ where: { code: '4-1100' } }); // Pendapatan Penjualan (System)
  const purchaseAccount = await prisma.account.findUnique({ where: { code: '5-2000' } }); // Beban Pembelian default (System)

  if (!apAccount || !arAccount || !cashAccount || !inventoryAccount || !cogsAccount || !revenueAccount || !purchaseAccount) {
    throw new Error('Required system accounts for default settings mapping are missing from the COA data.');
  }

  await prisma.accountingSettings.upsert({
    where: { id: 'default' },
    update: {
      apAccountId: apAccount.id,
      arAccountId: arAccount.id,
      cashAccountId: cashAccount.id,
      inventoryAccountId: inventoryAccount.id,
      cogsAccountId: cogsAccount.id,
      revenueAccountId: revenueAccount.id,
      purchaseAccountId: purchaseAccount.id,
    },
    create: {
      id: 'default',
      apAccountId: apAccount.id,
      arAccountId: arAccount.id,
      cashAccountId: cashAccount.id,
      inventoryAccountId: inventoryAccount.id,
      cogsAccountId: cogsAccount.id,
      revenueAccountId: revenueAccount.id,
      purchaseAccountId: purchaseAccount.id,
    },
  });
  console.info('  ✔ Accounting Settings initialized successfully.');

  console.info('\n🌱 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
