import { z } from "zod";
import { Relationship } from "../../../generated/prisma/enums.js";
import { createFamilySchema, createAssessmentSchema, updateAssessmentSchema, updateFamilySchema } from "./family.schema.js";
import { createFamilyMemberSchema, updateFamilyMemberSchema } from "./family-member.schema.js";
import { idSchema } from "../../../common/schemas/common.schema.js";

const titleSchema = z.string({ message: "Title is required" }).trim()
  .min(3, { message: "Title must be at least 3 characters" }).max(200, { message: "Title cannot exceed 200 characters" });

const createMembersSchema = z.array(createFamilyMemberSchema, { message: "Members must be an array" })
  .min(1, { message: "At least one family member is required" })
  .refine((members) => members.filter((member) => member.relationship === Relationship.HEAD).length === 1, {
    message: "Exactly one member must be the family head",
    path: ["members"],
  });

const updateMembersSchema = z.array(updateFamilyMemberSchema)

export const creatingFamilyRequestSchema = z.object({
  title: titleSchema,
  requestedFamily: createFamilySchema,
  assessedFamily: createAssessmentSchema,
  members: createMembersSchema,
  justification: z.string().trim().max(1000, { message: "Justification cannot exceed 1000 characters" }).optional(),
});

export const updatingFamilyRequestSchema =
  z.object({
    title: titleSchema,
    family: updateFamilySchema.optional(),
    assessment: updateAssessmentSchema.optional(),
    membersToCreate: z.array(createFamilyMemberSchema).default([]),
    membersToUpdate: z.array(updateFamilyMemberSchema.extend({id: idSchema })).default([]),
    membersToDelete: z.array(idSchema).default([]),
    justification: z.string().trim().max(1000, { message: "Justification cannot exceed 1000 characters" }).optional(),
  });

export const approveFamilyRequestSchema = z.object({
  reviewNotes: z.string().trim().max(1000, { message: "Review notes cannot exceed 1000 characters" }).optional(),
});

export const rejectFamilyRequestSchema = z.object({
  rejectionReason: z.string({ message: "Rejection reason is required" }).trim()
  .min(5, { message: "Rejection reason must be at least 5 characters" }).max(1000, { message: "Rejection reason cannot exceed 1000 characters" }),
});

export const cancelFamilyRequestSchema = z.object({
  reason: z.string({message: "Cancel reasona is required"}).trim()
  .max(1000, { message: "Reason cannot exceed 1000 characters" })
});

export type CreatingFamilyRequestDto = z.infer<typeof creatingFamilyRequestSchema>;
export type UpdatingFamilyRequestDto = z.infer<typeof updatingFamilyRequestSchema>;
export type ApproveFamilyRequestDto = z.infer<typeof approveFamilyRequestSchema>;
export type RejectFamilyRequestDto = z.infer<typeof rejectFamilyRequestSchema>;
export type CancelFamilyRequestDto = z.infer<typeof cancelFamilyRequestSchema>;
