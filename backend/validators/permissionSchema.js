import z from "zod";

export const addDirectoryPermissionValidation = z.object({
  email: z.email("Invalid email address"),
  role: z.enum(["owner", "manager", "editor", "viewer"]).optional(),
});

export const changeDirectoryPermisionValidation = z.object({
  userId: z.string("User Id is required"),
  role: z.enum(["owner", "manager", "editor", "viewer"]),
});

export const removeDirectoryPermisionValidation = z.object({
  userId: z.string("User Id is required"),
});

export const createShareLinkValidation = z.object({
  shareLink: z.string("Share Link is required"),
});
