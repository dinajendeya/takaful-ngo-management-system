import { prisma } from "../../src/lib/prisma.js";
import { GazaGovernorate } from "../../src/generated/prisma/enums.js";

async function seedBranches() {
  const branches = [
    {
      publicId: "BRN-000001",
      name: "Gaza Branch",
      governorate: GazaGovernorate.GAZA,
      address: "Gaza City",
      phone: "0599000001",
    },

    {
      publicId: "BRN-000002",
      name: "North Gaza Branch",
      governorate: GazaGovernorate.NORTH_GAZA,
      address: "Jabalia",
      phone: "0599000002",
    },

    {
      publicId: "BRN-000003",
      name: "Deir Al Balah Branch",
      governorate: GazaGovernorate.DEIR_AL_BALAH,
      address: "Deir Al Balah",
      phone: "0599000003",
    },

    {
      publicId: "BRN-000004",
      name: "Khan Younis Branch",
      governorate: GazaGovernorate.KHAN_YOUNIS,
      address: "Khan Younis",
      phone: "0599000004",
    },

    {
      publicId: "BRN-000005",
      name: "Rafah Branch",
      governorate: GazaGovernorate.RAFAH,
      address: "Rafah",
      phone: "0599000005",
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: {
        publicId: branch.publicId,
      },
      update: {},
      create: branch,
    });
  }

  console.log("✅ Branches seeded");
}

async function main() {
  await seedBranches();
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });