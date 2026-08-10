/**
 * Security log routes. [CSSECDV 2.4.4]
 *
 * GET only. There is deliberately no POST, PUT, PATCH or DELETE here, no
 * controller behind one, and no policy for one in the access-control table —
 * so a write request is denied by default rather than by omission. The audit
 * log is append-only, and it is written exclusively by the server.
 */

import express from "express";

import { validate } from "../middleware/validate.js";
import {
  listSecurityLogs,
  listEventTypes,
  getSecurityLogSummary,
} from "../controllers/securityLogController.js";
import { securityLogQuerySchema } from "../schemas/misc.schema.js";

const router = express.Router();

router.get("/event-types", listEventTypes);
router.get("/summary", getSecurityLogSummary);
router.get("/", validate(securityLogQuerySchema), listSecurityLogs);

export default router;
