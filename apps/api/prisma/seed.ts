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
