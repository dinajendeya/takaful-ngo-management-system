import { prisma } from "../../src/lib/prisma.js";
import { UserRole } from "../../src/generated/prisma/enums.js";
import { hashPassword } from "../../src/common/utils/password.js";

export const seedUsers = async () => {
  const [branch1, branch2] = await Promise.all([
    prisma.branch.findUnique({ where: { name: "Gaza Branch" }, select: { id: true } }),
    prisma.branch.findUnique({ where: { name: "North Gaza Branch" }, select: { id: true } }),
  ]);
  if (!branch1 || !branch2) throw new Error("Seed branches before users");

  const passwordHash = await hashPassword("Admin@123");

  const users = [
    {
      fullName: "Ahmad Abu Odeh",
      email: "ahmad.abuodeh@takaful.ps",
      passwordHash,
      role: UserRole.ADMIN,
      phone: "0599123456",
      isActive: true,
    },
    {
      fullName: "Mohammad Al-Najjar",
      email: "m.najjar@takaful.ps",
      passwordHash,
      role: UserRole.BRANCH_MANAGER,
      phone: "0599234567",
      branchId: branch1.id,
      isActive: true,
    },
    {
      fullName: "Omar Al-Masri",
      email: "omar.masri@takaful.ps",
      passwordHash,
      role: UserRole.BRANCH_MANAGER,
      phone: "0599345678",
      branchId: branch2.id,
      isActive: true,
    },
    {
      fullName: "Yousef Baraka",
      email: "y.baraka@takaful.ps",
      passwordHash,
      role: UserRole.FIELD_RESEARCHER,
      phone: "0599456789",
      branchId: branch1.id,
      isActive: true,
    },
    {
      fullName: "Alaa Al-Haddad",
      email: "alaa.haddad@takaful.ps",
      passwordHash,
      role: UserRole.FIELD_RESEARCHER,
      phone: "0599567890",
      branchId: branch1.id,
      isActive: true,
    },
    {
      fullName: "Mahmoud Abu Shamala",
      email: "m.abushamala@takaful.ps",
      passwordHash,
      role: UserRole.FIELD_RESEARCHER,
      phone: "0599678901",
      branchId: branch2.id,
      isActive: true,
    },
    {
      fullName: "Samer Abu Jazar",
      email: "samer.jazar@takaful.ps",
      passwordHash,
      role: UserRole.INVENTORY_MANAGER,
      phone: "0599789012",
      branchId: branch1.id,
      isActive: true,
    },
    {
      fullName: "Ibrahim Al-Astal",
      email: "i.astal@takaful.ps",
      passwordHash,
      role: UserRole.INVENTORY_MANAGER,
      phone: "0599890123",
      branchId: branch2.id,
      isActive: true,
    },
    {
      fullName: "Khaled Al-Qudra",
      email: "khaled.qudra@takaful.ps",
      passwordHash,
      role: UserRole.FINANCE_MANAGER,
      phone: "0599901234",
      branchId: branch1.id,
      isActive: true,
    },
    {
      fullName: "Hani Abu Taha",
      email: "hani.taha@takaful.ps",
      passwordHash,
      role: UserRole.FINANCE_MANAGER,
      phone: "0599012345",
      branchId: branch2.id,
      isActive: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
};