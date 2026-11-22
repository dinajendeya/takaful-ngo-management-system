import { prisma } from "../../src/lib/prisma.js";
import { UserRole } from "../../src/generated/prisma/enums.js";
import { hashPassword } from "../../src/common/utils/password.js";

export const seedUsers = async () => {
  const [branch1, branch2] = await Promise.all([
    prisma.branch.findUnique({ where: { publicId: "BRN-000001" }, select: { id: true } }),
    prisma.branch.findUnique({ where: { publicId: "BRN-000002" }, select: { id: true } }),
  ]);
  if (!branch1 || !branch2) throw new Error("Seed branches before users");

  const passwordHash = await hashPassword("Admin@123");

  const users = [
    {
      publicId: "USR-00001",
      fullName: "Ahmad Abu Odeh",
      email: "ahmad.abuodeh@takaful.ps",
      passwordHash,
      role: UserRole.ADMIN,
      phone: "0599123456",
      isActive: true,
    },
    {
      publicId: "USR-00002",
      fullName: "Mohammad Al-Najjar",
      email: "m.najjar@takaful.ps",
      passwordHash,
      role: UserRole.BRANCH_MANAGER,
      phone: "0599234567",
      branchId: branch1.id,
      isActive: true,
    },
    {
      publicId: "USR-00003",
      fullName: "Omar Al-Masri",
      email: "omar.masri@takaful.ps",
      passwordHash,
      role: UserRole.BRANCH_MANAGER,
      phone: "0599345678",
      branchId: branch2.id,
      isActive: true,
    },
    {
      publicId: "USR-00004",
      fullName: "Yousef Baraka",
      email: "y.baraka@takaful.ps",
      passwordHash,
      role: UserRole.FIELD_RESEARCHER,
      phone: "0599456789",
      branchId: branch1.id,
      isActive: true,
    },
    {
      publicId: "USR-00005",
      fullName: "Alaa Al-Haddad",
      email: "alaa.haddad@takaful.ps",
      passwordHash,
      role: UserRole.FIELD_RESEARCHER,
      phone: "0599567890",
      branchId: branch1.id,
      isActive: true,
    },
    {
      publicId: "USR-00006",
      fullName: "Mahmoud Abu Shamala",
      email: "m.abushamala@takaful.ps",
      passwordHash,
      role: UserRole.FIELD_RESEARCHER,
      phone: "0599678901",
      branchId: branch2.id,
      isActive: true,
    },
    {
      publicId: "USR-00007",
      fullName: "Samer Abu Jazar",
      email: "samer.jazar@takaful.ps",
      passwordHash,
      role: UserRole.INVENTORY_MANAGER,
      phone: "0599789012",
      branchId: branch1.id,
      isActive: true,
    },
    {
      publicId: "USR-00008",
      fullName: "Ibrahim Al-Astal",
      email: "i.astal@takaful.ps",
      passwordHash,
      role: UserRole.INVENTORY_MANAGER,
      phone: "0599890123",
      branchId: branch2.id,
      isActive: true,
    },
    {
      publicId: "USR-00009",
      fullName: "Khaled Al-Qudra",
      email: "khaled.qudra@takaful.ps",
      passwordHash,
      role: UserRole.FINANCE_MANAGER,
      phone: "0599901234",
      branchId: branch1.id,
      isActive: true,
    },
    {
      publicId: "USR-00010",
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
      where: { publicId: user.publicId },
      update: {},
      create: user,
    });
  }
};