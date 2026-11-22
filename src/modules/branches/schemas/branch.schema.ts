import { z } from "zod";
import { GazaGovernorate } from "../../../generated/prisma/enums.js";

export const createBranchSchema = z.object({
  name: z
    .string({message: "Branch name is required",})
    .min(3, {message:"Branch name must be at least 3 characters",})
    .max(150, {message:"Branch name cannot exceed 150 characters",}),

  governorate: z.enum(GazaGovernorate, { message: "Please select a valid Gaza governorate"}),

  address: z.string().max(500, {message: "Address cannot exceed 500 characters",}).optional(),

  phone: z.string().regex(/^(\+970|0)?5\d{8}$/,{message:"Please provide a valid Palestinian mobile number",}
    )
    .optional(),
});

export const updateBranchSchema =
  createBranchSchema.partial();

export type CreateBranchDto =
  z.infer<typeof createBranchSchema>;

export type UpdateBranchDto =
  z.infer<typeof updateBranchSchema>;