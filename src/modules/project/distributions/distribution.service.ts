import { parseId } from "../../../common/utils/parseId.js";
import * as distributionRepository from "./distribution.repository.js";
import * as projectRepository from "../projects/project.repository.js";
import * as familyRepository from "../../family/repositories/family.repository.js";
import type { CreateDistributionDto, CreateDistributionData } from "./distribution.types.js";
import type { AuthUser } from "../../../common/types/auth-user.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";

export const create = async (data: CreateDistributionDto, requestUser: AuthUser) => {
  const familyId = parseId(data.familyId);
  const projectId = parseId(data.projectId);
  const parcelTemplateId = parseId(data.parcelTemplateId);

  // 1. Fetch Dependencies
  const family = await familyRepository.findFamilyById(familyId);
  if (!family) throw new Error("Family not found");

  const project = await projectRepository.findById(projectId);
  if (!project) throw new Error("Project not found");

  // 2. Branch Security (Row-Level Scoping)
  if (requestUser.role === UserRole.BRANCH_MANAGER || requestUser.role === UserRole.DISTRIBUTOR) {
    if (!requestUser.branchId || family.branchId.toString() !== requestUser.branchId) {
      throw new Error("You can only distribute aid to families within your own branch");
    }
  }

  // 3. Verify the Project actually has this parcel and has stock left
  const projectParcel = await distributionRepository.findProjectParcel(projectId, parcelTemplateId);
  if (!projectParcel) throw new Error("This parcel is not part of the selected project");
  
  if (projectParcel.availableQuantity <= 0) {
    throw new Error("No available parcels left four this project");
  }

  // 4. Atomic Transaction: Decrement budget and create distribution
  try {
    return await prisma.$transaction(async (tx) => {
      // Decrement budget
      await tx.projectParcel.update({
        where: { projectId_parcelTemplateId: { projectId, parcelTemplateId } },
        data: { availableQuantity: { decrement: 1 } },
      });

      // Create distribution
      const createData: CreateDistributionData = {
        familyId,
        branchId: family.branchId,
        projectId,
        parcelTemplateId,
        distributedById: parseId(requestUser.sub),
        ...(data.notes !== undefined && { notes: data.notes }),
      };

      return tx.distribution.create({
        data: createData,
        include: {
          family: { select: { id: true, publicId: true } },
          branch: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          parcelTemplate: { select: { id: true, name: true } },
          distributedBy: { select: { id: true, fullName: true } },
        },
      });
    });
  } catch (error: any) {
    // Catch Prisma P2002 (Unique Constraint Violation)
    if (error.code === 'P2002') {
      throw new Error("This family has already received a parcel for this project");
    }
    throw error;
  }
};

export const list = async (requestUser: AuthUser) => {
  // Branch Managers and Distributors only see their branch's history
  const branchFilter = (requestUser.role === UserRole.BRANCH_MANAGER || requestUser.role === UserRole.DISTRIBUTOR) && requestUser.branchId
    ? parseId(requestUser.branchId)
    : undefined;

  return distributionRepository.findMany(branchFilter);
};

export const getById = async (id: string, requestUser: AuthUser) => {
  const distribution = await distributionRepository.findById(parseId(id));
  if (!distribution) throw new Error("Distribution record not found");

  if ((requestUser.role === UserRole.BRANCH_MANAGER || requestUser.role === UserRole.DISTRIBUTOR) && distribution.branchId.toString() !== requestUser.branchId) {
    throw new Error("Unauthorized to view this distribution");
  }

  return distribution;
};