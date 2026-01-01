import { z } from "zod";
import { ROLE } from "../constants/role.js";

// validate role
export const userRoleChangeValidation = z.object({
  role: z.enum(ROLE, "Role is required"),
});
