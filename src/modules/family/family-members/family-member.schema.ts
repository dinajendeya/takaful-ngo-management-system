import { z, type ZodType } from "zod";
import { Gender, MaritalStatus, EmploymentStatus, EducationLevel, Relationship } from "../../../generated/prisma/enums.js";
import { idSchema, phoneSchema } from "../../../common/schemas/common.schema.js";

type FamilyMemberValidationData = {
  hasDisability?: boolean | undefined;
  disabilityType?: string | undefined;
  hasChronicDisease?: boolean | undefined;
  diseaseName?: string | undefined;
  educationLevel?: EducationLevel | undefined;
  educationMajor?: string | undefined;
};

const familyMemberValidation = <T extends ZodType<FamilyMemberValidationData>>(schema: T) => schema
  .refine((data) => !data.hasDisability || !!data.disabilityType, {message: "Disability type is required when there is a disability", path: ["disabilityType"],})
  .refine((data) => data.hasDisability || !data.disabilityType, {message: "Disability type is only allowed when there is a disability", path: ["disabilityType"],})
  .refine((data) => !data.hasChronicDisease || !!data.diseaseName, { message: "Disease name is required when there is a chronic disease", path: ["diseaseName"] })
  .refine((data) => data.hasChronicDisease || !data.diseaseName, { message: "Disease name is only allowed when there is a chronic disease", path: ["diseaseName"] })
  .refine((data) => !isHigherEducation(data.educationLevel) || !!data.educationMajor, { message: "Education major is required for Diploma, Bachelor, Master, or PhD", path: ["educationMajor"] })
  .refine((data) => isHigherEducation(data.educationLevel) || !data.educationMajor, { message: "Education major is only allowed for Diploma, Bachelor, Master, or PhD", path: ["educationMajor"] })

const isHigherEducation = (level?: EducationLevel) =>
  level === EducationLevel.DIPLOMA ||
  level === EducationLevel.BACHELOR ||
  level === EducationLevel.MASTER ||
  level === EducationLevel.PHD;

const familyMemberBaseSchema = z.object({
  nationalId: z.string().trim().regex(/^\d{9}$/, {message: "National ID must contain exactly 9 digits"}),
  fullName: z.string({ message: "Full name is required" }).trim().min(3, { message: "Full name must be at least 3 characters" }).max(200, { message: "Full name cannot exceed 200 characters" }),
  gender: z.enum(Gender, { message: "Please select a valid gender" }),
  birthDate: z.coerce.date({ message: "Birth date is required" }).max(new Date(), { message: "Birth date cannot be in the future" }),
  phone: phoneSchema.optional(),
  relationship: z.enum(Relationship, { message: "Please select a valid relationship" }),
  educationLevel: z.enum(EducationLevel).optional(),
  educationMajor: z.string().trim().max(200, { message: "Education major cannot exceed 200 characters" }).optional(),
  educationFees: z.number().min(0, { message: "Education fees cannot be negative" }).nullable().optional(),
  employmentStatus: z.enum(EmploymentStatus).default("UNEMPLOYED"),
  monthlyIncome: z.number().min(0, { message: "Monthly income cannot be negative" }).default(0),
  hasDisability: z.boolean().default(false),
  disabilityType: z.string().trim().max(150, { message: "Disability type cannot exceed 150 characters" }).optional(),
  hasChronicDisease: z.boolean().default(false),
  diseaseName: z.string().trim().max(150, { message: "Disease name cannot exceed 150 characters" }).optional(),
  maritalStatus: z.enum(MaritalStatus).default("SINGLE"),
  isOrphan: z.boolean().default(false),
  isBasedInGaza: z.boolean().default(true),
});

export const createFamilyMembersSchema = z.array(familyMemberBaseSchema);

export const createFamilyMemberSchema = familyMemberValidation(familyMemberBaseSchema);
  
export const updateFamilyMemberSchema = familyMemberValidation(
  familyMemberBaseSchema.partial().extend({
    id: idSchema.optional(),
  }),
);