import { z } from "zod";

// -> req.body = {name: string}
export const nameValidation = z.object({
  name: z.string().min(1, "Name must be at least 1 characters long").optional(),
});

//  -> req.body = {folderId: string}
export const importDriveDataValidation = z.object({
  id: z.string("Folder Id is required"),
  mimeType: z.string("Folder Id is required"),
  name: z.string("Folder Id is required"),
});

// batch options
export const batchOprationValidation = z.object({
  ids: z.array(z.string()).min(1, "Ids are the required"),
});
