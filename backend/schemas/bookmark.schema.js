import { z, request, uuid } from "./common.js";

export const MAX_BOOKMARK_NOTE_LENGTH = 280;

// Notes are private free text, so spaces and line breaks are meaningful. They
// are accepted exactly as submitted, never trimmed or repaired.
export const bookmarkNote = z
  .string({ message: "Note must be text." })
  .max(
    MAX_BOOKMARK_NOTE_LENGTH,
    `Note must be ${MAX_BOOKMARK_NOTE_LENGTH} characters or fewer.`,
  )
  .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value), {
    message: "Note contains unsupported control characters.",
  });

export const createBookmarkSchema = request({
  body: z
    .object({
      projectId: uuid,
      note: bookmarkNote.optional(),
    })
    .strict(),
});

export const bookmarkIdSchema = request({
  params: z.object({ bookmarkId: uuid }).strict(),
});

export const updateBookmarkSchema = request({
  params: z.object({ bookmarkId: uuid }).strict(),
  body: z.object({ note: bookmarkNote }).strict(),
});
