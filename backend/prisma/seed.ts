import { runSeed } from '../src/utils/seeder';
import { prisma } from '../src/utils/prisma';

export async function main() {
  await runSeed();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error during seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
