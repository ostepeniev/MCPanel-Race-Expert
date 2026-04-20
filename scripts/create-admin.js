/**
 * Create admin user CLI tool.
 *
 * Usage: node scripts/create-admin.js --email=ceo@example.com --password=secret --role=CEO
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value;
  });
  return args;
}

async function main() {
  const args = parseArgs();

  const email = args.email;
  const password = args.password;
  const name = args.name || 'Admin';
  const role = args.role || 'CEO';
  const department = args.department || 'ALL';

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.js --email=EMAIL --password=PASSWORD [--name=NAME] [--role=CEO|MANAGER|VIEWER] [--department=ALL]');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`❌ User ${email} already exists.`);
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      name,
      role,
      department,
    },
  });

  console.log(`✅ User created: ${user.email} (${user.role}/${user.department})`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
