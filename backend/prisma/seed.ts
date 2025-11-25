import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.player.upsert({
    where: { username: 'alice' },
    update: {},
    create: { username: 'alice' },
  });
  const bob = await prisma.player.upsert({
    where: { username: 'bob' },
    update: {},
    create: { username: 'bob' },
  });

  const game = await prisma.game.create({
    data: {
      board: '---------',
      nextTurn: 'X',
      status: 'waiting',
      playerXId: alice.id,
      playerOId: bob.id,
    },
  });

  console.log('Seed complete:', {
    alice: alice.username,
    bob: bob.username,
    gameId: game.id,
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
