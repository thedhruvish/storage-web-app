import { z } from "zod";

// -> req.body = {name: string}
export const nameValidation = z.object({
  name: z.string().min(1, "Name must be at least 1 characters long").optional(),
});

//  -> req.body = {folderId: string}
export const importDriveDataValidation = z.object({
  folderId: z.string("Folder Id is required"),
});
