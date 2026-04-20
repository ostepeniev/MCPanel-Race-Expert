/**
 * Prisma seed — creates initial admin user and default alert rules.
 *
 * Usage: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ──
  const adminEmail = process.env.ADMIN_EMAIL || 'ceo@raceexpert.com.ua';
  const adminPassword = process.env.ADMIN_PASSWORD || 'RaceExpert2026!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        name: 'CEO Race Expert',
        role: 'CEO',
        department: 'ALL',
      },
    });
    console.log(`✅ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // ── Default alert rules ──
  const defaultRules = [
    {
      name: 'Маржа бренду знизилась',
      metric: 'margin_by_brand',
      operator: 'CHANGE_LT',
      threshold: -3,
      severity: 'WARNING',
      cooldownMin: 120,
      drillPage: '/sales',
    },
    {
      name: 'Невідвантажені замовлення > 48г',
      metric: 'unshipped_48h',
      operator: 'GT',
      threshold: 100,
      severity: 'DANGER',
      cooldownMin: 60,
      drillPage: '/warehouse/delays',
    },
    {
      name: 'Денна виручка нижче норми',
      metric: 'daily_revenue',
      operator: 'LT',
      threshold: 500000,
      severity: 'WARNING',
      cooldownMin: 1440,
      drillPage: '/sales',
    },
    {
      name: 'SLA відвантаження перевищено',
      metric: 'avg_ship_time',
      operator: 'GT',
      threshold: 24,
      severity: 'DANGER',
      cooldownMin: 60,
      drillPage: '/warehouse',
    },
    {
      name: 'Високий відсоток повернень',
      metric: 'return_rate',
      operator: 'GT',
      threshold: 5,
      severity: 'WARNING',
      cooldownMin: 1440,
      drillPage: '/orders',
    },
  ];

  for (const rule of defaultRules) {
    const existing = await prisma.alertRule.findFirst({
      where: { metric: rule.metric },
    });

    if (!existing) {
      await prisma.alertRule.create({ data: rule });
      console.log(`✅ Alert rule: ${rule.name}`);
    }
  }

  // ── Default finance accounts ──
  const accounts = [
    { name: 'ПриватБанк', type: 'BANK', balance: 0, currency: 'UAH' },
    { name: 'Monobank', type: 'BANK', balance: 0, currency: 'UAH' },
    { name: 'Каса', type: 'CASH', balance: 0, currency: 'UAH' },
    { name: 'Резервний фонд', type: 'OTHER', balance: 0, currency: 'UAH' },
  ];

  for (const acc of accounts) {
    const existing = await prisma.financeAccount.findFirst({
      where: { name: acc.name },
    });
    if (!existing) {
      await prisma.financeAccount.create({ data: acc });
      console.log(`✅ Account: ${acc.name}`);
    }
  }

  // ── Default monthly targets (current month) ──
  const now = new Date();
  const targets = [
    { year: now.getFullYear(), month: now.getMonth() + 1, metric: 'revenue', targetValue: 25000000 },
    { year: now.getFullYear(), month: now.getMonth() + 1, metric: 'orders', targetValue: 25000 },
    { year: now.getFullYear(), month: now.getMonth() + 1, metric: 'margin', targetValue: 45 },
    { year: now.getFullYear(), month: now.getMonth() + 1, metric: 'ship_sla', targetValue: 24 },
  ];

  for (const t of targets) {
    await prisma.monthlyTarget.upsert({
      where: {
        year_month_metric: { year: t.year, month: t.month, metric: t.metric },
      },
      update: {},
      create: t,
    });
    console.log(`✅ Target: ${t.metric} = ${t.targetValue}`);
  }

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
