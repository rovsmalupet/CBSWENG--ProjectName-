import express from "express";

import {
  createBookmark,
  deleteBookmark,
  listBookmarks,
  updateBookmark,
} from "../controllers/bookmarkController.js";
import { validate } from "../middleware/validate.js";
import { emptyRequestSchema } from "../schemas/common.js";
import {
  bookmarkIdSchema,
  createBookmarkSchema,
  updateBookmarkSchema,
} from "../schemas/bookmark.schema.js";

const router = express.Router();

router.get("/", validate(emptyRequestSchema), listBookmarks);
router.post("/", validate(createBookmarkSchema), createBookmark);
router.patch("/:bookmarkId", validate(updateBookmarkSchema), updateBookmark);
router.delete("/:bookmarkId", validate(bookmarkIdSchema), deleteBookmark);

export default router;
