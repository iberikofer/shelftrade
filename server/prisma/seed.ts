import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ShelfTrade database...');

  // Clean existing data
  await prisma.exchangeRequest.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Moderator',
      email: 'admin@shelftrade.local',
      passwordHash,
      role: Role.ADMIN,
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 2. Create User Alice (Reader)
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Hemingway',
      email: 'alice@shelftrade.local',
      passwordHash,
      role: Role.USER,
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 3. Create User Bob
  const bob = await prisma.user.create({
    data: {
      name: 'Bob Orwell',
      email: 'bob@shelftrade.local',
      passwordHash,
      role: Role.USER,
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 4. Create Books for Alice
  const aliceBooks = [
    {
      title: '1984',
      author: 'George Orwell',
      photoUrl: 'https://covers.openlibrary.org/b/id/12843075-L.jpg',
      ownerId: alice.id,
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      photoUrl: 'https://covers.openlibrary.org/b/id/8225261-L.jpg',
      ownerId: alice.id,
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      photoUrl: 'https://covers.openlibrary.org/b/id/12690947-L.jpg',
      ownerId: alice.id,
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      photoUrl: 'https://covers.openlibrary.org/b/id/12645114-L.jpg',
      ownerId: alice.id,
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      photoUrl: 'https://covers.openlibrary.org/b/id/11132644-L.jpg',
      ownerId: alice.id,
    },
  ];

  // 5. Create Books for Bob
  const bobBooks = [
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      photoUrl: 'https://covers.openlibrary.org/b/id/12002766-L.jpg',
      ownerId: bob.id,
    },
    {
      title: 'Crime and Punishment',
      author: 'Fyodor Dostoevsky',
      photoUrl: 'https://covers.openlibrary.org/b/id/12089201-L.jpg',
      ownerId: bob.id,
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      photoUrl: 'https://covers.openlibrary.org/b/id/8228691-L.jpg',
      ownerId: bob.id,
    },
    {
      title: 'One Hundred Years of Solitude',
      author: 'Gabriel García Márquez',
      photoUrl: 'https://covers.openlibrary.org/b/id/12028886-L.jpg',
      ownerId: bob.id,
    },
    {
      title: 'Fahrenheit 451',
      author: 'Ray Bradbury',
      photoUrl: 'https://covers.openlibrary.org/b/id/12078652-L.jpg',
      ownerId: bob.id,
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      photoUrl: 'https://covers.openlibrary.org/b/id/12818862-L.jpg',
      ownerId: bob.id,
    },
  ];

  for (const book of [...aliceBooks, ...bobBooks]) {
    await prisma.book.create({ data: book });
  }

  console.log('✅ Seeding complete!');
  console.log(`- Admin: admin@shelftrade.local (Password123!)`);
  console.log(
    `- User 1: alice@shelftrade.local (Password123!) [${aliceBooks.length} books]`,
  );
  console.log(`- User 2: bob@shelftrade.local (Password123!) [${bobBooks.length} books]`);
}

main()
  .catch(e => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
