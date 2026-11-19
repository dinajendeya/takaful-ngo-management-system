import { prisma } from "../../src/lib/prisma.js";
import { seedBranches } from "./branch.seed.js";
import { seedUsers } from "./auth.seed.js";

const main = async () => {
  await seedBranches();
  await seedUsers();
  console.log("Branches and users seeded");
};

main()
  .catch((error) => {
    console.error("Database seeding failed", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());