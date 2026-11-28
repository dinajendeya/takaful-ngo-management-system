import type { z } from "zod";
import type { AuthUser } from "../../../common/types/auth-user.js";
import type { changePasswordSchema, forgotPasswordSchema, loginSchema, logoutSchema, refreshSchema, resetPasswordSchema } from "./auth.schema.js";

export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;
export type LogoutDto = z.infer<typeof logoutSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type { AuthUser };
