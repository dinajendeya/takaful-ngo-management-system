import type { createFamilyDTO, createFamilyAssessmentDTO, createFamilyMemberDTO } from "../schemas/family.schema.js"
import {prisma} from "../../../lib/prisma.js";
import type {FamilyStatus} from "../../../generated/prisma/enums.js"

const selectedFamily = {
    id: true,
    head_family: true,
    address: {
        id: true,
        city: true,
        street: true,
        nearLandMark: true
    }
    familyAssessment: {
        is_displaced: true,
        has_internet: true,
        has_electricity: true

}
export const createFamily = async(data: createFamilyDTO & createFamilyAssessmentDTO){
    return prisma.family.create({
        data: {
            headId: data.headId,
            verifidBy: data.verified_by,
            has_electricity: data.has_electricity,
            has_internet: data.has_internet
        },
        select: selectedFamily
    })
}

export const updateFamily = async(data: updateFamilyDTO & createFamilyAssessmentDTO){
    return prisma.family.update({
        where: {id: data.id},
        data: {
            is_displaced: data.is_displaced,
        }
    })
}

export const findAll = async() => {
    return prisma.family.findMany({
        select: selectedFamily,
        orderBy: {createdAt: "asc"}
    })
}

}

export const verifiedFamily = async(familyId: string, userId: string) => {
    return prisma.family.update({
        where: {familyId}
        data: {verified_by: userId, family_status: "verified", verifiedAt: new Date(now())}
    })
}