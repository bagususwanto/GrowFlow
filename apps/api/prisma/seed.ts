import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Start seeding...');

  // 1. Seed Roles
  const rolesData = [
    { name: 'superadmin', permissions: ['*'] },
    { name: 'manager', permissions: ['read:*', 'write:po:approve', 'write:so:approve'] },
    { name: 'staff', permissions: ['read:*', 'write:po:create', 'write:so:create'] },
    { name: 'finance', permissions: ['read:*', 'write:accounting:*', 'write:payroll:*'] },
    { name: 'warehouse', permissions: ['read:*', 'write:inventory:*', 'write:grn:create'] },
  ];

  const roles = [];
  for (const role of rolesData) {
    const upsertedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        permissions: JSON.stringify(role.permissions),
      },
    });
    roles.push(upsertedRole);
    console.info(`Created role: ${role.name}`);
  }

  // 2. Seed Superadmin User
  const superadminEmail = 'admin@growflow.com';
  const superadminRole = roles.find((r) => r.name === 'superadmin');

  if (!superadminRole) {
    throw new Error('Superadmin role was not created successfully.');
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const superadmin = await prisma.user.upsert({
    where: { email: superadminEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: superadminEmail,
      passwordHash,
      roleId: superadminRole.id,
      isActive: true,
    },
  });

  console.info(`Created superadmin user: ${superadmin.email}`);

  // 3. Seed Warehouses
  const warehousesData = [
    { name: 'Gudang Utama', address: 'Jl. Industri No. 12, Bekasi' },
    { name: 'Gudang Cabang', address: 'Jl. Rungkut Industri No. 45, Surabaya' },
  ];

  const warehouses = [];
  for (const wh of warehousesData) {
    const upsertedWh = await prisma.warehouse.upsert({
      where: { id: wh.name === 'Gudang Utama' ? 'e9c8a2b5-55ff-4be5-9430-c3d3958c279c' : 'f3dbdf7c-50ab-48d6-9cb3-b2d9de59ee93' },
      update: { address: wh.address },
      create: {
        id: wh.name === 'Gudang Utama' ? 'e9c8a2b5-55ff-4be5-9430-c3d3958c279c' : 'f3dbdf7c-50ab-48d6-9cb3-b2d9de59ee93'        ,
        name: wh.name,
        address: wh.address,
        isActive: true,
      },
    });
    warehouses.push(upsertedWh);
    console.info(`Created warehouse: ${wh.name}`);
  }

  // 4. Seed Category Items
  const categoriesData = [
    { name: 'Elektronik', description: 'Barang-barang elektronik dan komputer' },
    { name: 'Furniture', description: 'Peralatan kantor dan mebel' },
    { name: 'ATK', description: 'Alat tulis kantor dan kertas' },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const upsertedCat = await prisma.categoryItem.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: {
        name: cat.name,
        description: cat.description,
      },
    });
    categoriesMap[cat.name] = upsertedCat.id;
    console.info(`Created category: ${cat.name}`);
  }

  // 4b. Seed Items
  const itemsData = [
    { code: 'ITEM-EL-001', name: 'Laptop ThinkPad L14', unit: 'pcs', categoryName: 'Elektronik', minStock: 5 },
    { code: 'ITEM-FT-002', name: 'Meja Kerja Minimalis', unit: 'unit', categoryName: 'Furniture', minStock: 2 },
    { code: 'ITEM-ATK-003', name: 'Kertas A4 80gr', unit: 'rim', categoryName: 'ATK', minStock: 10 },
  ];

  const items = [];
  for (const item of itemsData) {
    const categoryId = categoriesMap[item.categoryName] || null;
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
    items.push(upsertedItem);
    console.info(`Created item: ${item.name}`);
  }

  // 5. Seed Partners
  const partnersData = [
    { code: 'SUP-0001', name: 'PT Multi Kencana Elektronik', type: 'SUPPLIER' as const, email: 'sales@multikencana.co.id', phone: '021-5551234', address: 'Kawasan Industri Jababeka, Cikarang' },
    { code: 'SUP-0002', name: 'CV Rimba Abadi', type: 'SUPPLIER' as const, email: 'rimba.abadi@gmail.com', phone: '08123456789', address: 'Jl. Raya Jepara KM 7, Jepara' },
    { code: 'CUS-0001', name: 'PT Solusi Teknologi Nusantara', type: 'CUSTOMER' as const, email: 'procurement@solusitekno.com', phone: '021-8884321', address: 'Sudirman Central Business District, Jakarta' },
    { code: 'CUS-0002', name: 'Yayasan Harapan Bangsa', type: 'CUSTOMER' as const, email: 'info@harapanbangsa.or.id', phone: '021-7773333', address: 'Jl. Pemuda No. 100, Bandung' },
    { code: 'CUS-0003', name: 'PT Sinar Makmur Sejahtera', type: 'CUSTOMER' as const, email: 'info@sinarmakmur.com', phone: '021-9990000', address: 'Jl. Gatot Subroto No. 50, Semarang' },
  ];

  for (const partner of partnersData) {
    await prisma.partner.upsert({
      where: { code: partner.code },
      update: { name: partner.name, type: partner.type, email: partner.email, phone: partner.phone, address: partner.address },
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
    console.info(`Created partner: ${partner.name} (${partner.type})`);
  }

  // 6. Seed Stock Balances
  // Let's seed initial stock in Gudang Utama (first warehouse)
  const mainWarehouse = warehouses[0];
  const stockBalancesData = [
    { itemId: items[0].id, warehouseId: mainWarehouse.id, qty: 15 },
    { itemId: items[1].id, warehouseId: mainWarehouse.id, qty: 8 },
    { itemId: items[2].id, warehouseId: mainWarehouse.id, qty: 50 },
  ];

  for (const balance of stockBalancesData) {
    await prisma.stockBalance.upsert({
      where: {
        itemId_warehouseId: {
          itemId: balance.itemId,
          warehouseId: balance.warehouseId,
        },
      },
      update: { qty: balance.qty },
      create: {
        itemId: balance.itemId,
        warehouseId: balance.warehouseId,
        qty: balance.qty,
      },
    });
    console.info(`Set stock balance for item ID ${balance.itemId} at ${mainWarehouse.name} to ${balance.qty}`);
  }

  console.info('🌱 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

