/**
 * Administrator account management routes.
 *
 * Every path here is admin-only and requires re-authentication, both declared
 * in security/accessControl.js. [CSSECDV 2.1.13]
 */

import express from "express";

import { validate } from "../middleware/validate.js";
import {
  listUsers,
  createUser,
  changeUserRole,
  disableUser,
  unlockUser,
  forcePasswordReset,
} from "../controllers/adminUserController.js";
import {
  listUsersSchema,
  createUserSchema,
  changeRoleSchema,
  accountIdSchema,
} from "../schemas/auth.schema.js";

const router = express.Router();

router.get("/users", validate(listUsersSchema), listUsers);
router.post("/users", validate(createUserSchema), createUser);
router.patch("/users/:id/role", validate(changeRoleSchema), changeUserRole);
router.delete("/users/:id", validate(accountIdSchema), disableUser);
router.post("/users/:id/unlock", validate(accountIdSchema), unlockUser);
router.post("/users/:id/force-reset", validate(accountIdSchema), forcePasswordReset);

export default router;
