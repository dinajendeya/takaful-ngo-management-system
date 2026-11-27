import { prisma } from "../../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";

const donorPublicFields = {
  id: true,
  name: true,
  contactPerson: true,
  phone: true,
  email: true,
  donorType: true,
  notes: true,
  createdAt: true,
};

export const findById = async (id: bigint) =>
  prisma.donor.findUnique({
    where: { id },
    select: donorPublicFields,
  });

export const findMany = async (skip: number, take: number) =>
  prisma.donor.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: {
      ...donorPublicFields,
      _count: { select: { donations: true } },
    },
  });

export const update = async (id: bigint, data: Prisma.DonorUpdateInput) =>
  prisma.donor.update({
    where: { id },
    data,
    select: donorPublicFields,
  });