import { prisma } from '~/db.server.ts';

export async function resetDB() {
  // execSync('npx prisma migrate reset --force');  // waste too much time
  await prisma.user.deleteMany();
  // add more deleteMany here if needed
}
