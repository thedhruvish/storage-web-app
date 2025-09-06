import { z } from "zod";

// validate role
export const userRoleChangeValidation = z.object({
  role: z.enum(["owner", "admin", "manager", "user"], "Role is required"),
});
