import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin_change_me', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ahhhmetv.com' },
    update: {},
    create: {
      email: 'admin@ahhhmetv.com',
      username: 'admin',
      displayName: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      country: 'US',
      bio: 'AHHHMETV Platform Administrator',
    },
  });
  console.log(`  ✅ Admin user created: ${admin.email}`);

  const modPassword = await bcrypt.hash('mod_change_me', 12);
  const moderator = await prisma.user.upsert({
    where: { email: 'mod@ahhhmetv.com' },
    update: {},
    create: {
      email: 'mod@ahhhmetv.com',
      username: 'moderator',
      displayName: 'Moderator',
      password: modPassword,
      role: 'MODERATOR',
      isVerified: true,
      country: 'US',
      bio: 'AHHHMETV Moderator',
    },
  });
  console.log(`  ✅ Moderator user created: ${moderator.email}`);

  const testUsers = [
    { email: 'alice@test.com', username: 'alice', displayName: 'Alice', country: 'US', interests: ['music', 'gaming', 'movies'], age: 25, gender: 'FEMALE' as const },
    { email: 'bob@test.com', username: 'bob', displayName: 'Bob', country: 'UK', interests: ['sports', 'gaming', 'travel'], age: 28, gender: 'MALE' as const },
  ];

  const password = await bcrypt.hash('testpass123', 12);

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password,
        bio: `Hey! I'm ${userData.displayName} from ${userData.country}.`,
        languages: ['English'],
      },
    });
    console.log(`  ✅ Test user created: ${user.email}`);
  }

  await prisma.announcement.create({
    data: {
      title: 'Welcome to AHHHMETV! 🎉',
      content: 'Spontaneous conversations and global connections await.',
      type: 'info',
      isActive: true,
      createdBy: admin.id,
    },
  });
  console.log('  ✅ Sample announcement created');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
