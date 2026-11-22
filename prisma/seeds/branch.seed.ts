import { prisma } from "../../src/lib/prisma.js";
import { GazaGovernorate } from "../../src/generated/prisma/enums.js";

export const seedBranches = async () => {
  const branches = [
    {
      name: "Gaza Branch",
      governorate: GazaGovernorate.GAZA,
      address: "Gaza City",
      phone: "0599000001",
    },

    {
      name: "North Gaza Branch",
      governorate: GazaGovernorate.NORTH_GAZA,
      address: "Jabalia",
      phone: "0599000002",
    },

    {
      name: "Deir Al Balah Branch",
      governorate: GazaGovernorate.DEIR_AL_BALAH,
      address: "Deir Al Balah",
      phone: "0599000003",
    },

    {
      name: "Khan Younis Branch",
      governorate: GazaGovernorate.KHAN_YOUNIS,
      address: "Khan Younis",
      phone: "0599000004",
    },

    {
      name: "Rafah Branch",
      governorate: GazaGovernorate.RAFAH,
      address: "Rafah",
      phone: "0599000005",
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { name: branch.name },
      update: {},
      create: branch,
    });
  }
};