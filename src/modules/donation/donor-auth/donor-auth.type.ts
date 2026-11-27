import { donorLoginSchema, donorRegisterSchema } from "./donor-auth.schema.js";
import { z } from "zod";

export type DonorLoginDto = z.infer< typeof donorLoginSchema>;
export type DonorRegisterDto = z.infer< typeof donorRegisterSchema>;