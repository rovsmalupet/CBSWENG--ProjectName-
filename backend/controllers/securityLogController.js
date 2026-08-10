/**
 * securityLogController.js — the administrator's read-only view of the security
 * log. [CSSECDV 2.4.4]
 *
 * "The only role that has read-only access to the application logs."
 *
 * Read-only is structural, not a convention. There is no create, update, or
 * delete function in this file; there is no policy for a non-GET method on
 * /security-logs in the access-control table (a test asserts this); and
 * securityLog.js exposes no mutation helper. An administrator can read the log
 * and nothing else — including an attacker who reaches an administrator
 * session and would very much like to erase their tracks.
 *
 * Reading the log is itself logged.
 */

import prisma from "../prisma/client.js";
import { EVENTS, OUTCOME, SEVERITY, logSecurityEvent } from "../security/securityLog.js";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/** Translate validated query filters into a Prisma `where` clause. */
const buildWhere = (query) => {
  const where = {};

  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) {
      // An inclusive end date: "to=2026-08-09" should include everything that
      // happened on the 9th, not stop at midnight.
      const to = new Date(query.to);
      if (/^\d{4}-\d{2}-\d{2}$/.test(query.to)) to.setUTCHours(23, 59, 59, 999);
      where.createdAt.lte = to;
    }
  }

  if (query.eventType) where.eventType = query.eventType;
  if (query.outcome) where.outcome = query.outcome;
  if (query.severity) where.severity = query.severity;
  if (query.actorEmail) where.actorEmail = { contains: query.actorEmail, mode: "insensitive" };
  if (query.ipAddress) where.ipAddress = { contains: query.ipAddress };
  if (query.targetId) where.targetId = query.targetId;
  if (query.q) where.message = { contains: query.q, mode: "insensitive" };

  return where;
};

/** GET /security-logs */
export const listSecurityLogs = async (req, res) => {
  const query = req.validated.query;
  const page = Number(query.page ?? 1);
  const limit = Math.min(Number(query.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const where = buildWhere(query);

  const [total, entries] = await Promise.all([
    prisma.securityLog.count({ where }),
    prisma.securityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  // Who reads the audit log is itself a security event worth recording.
  await logSecurityEvent(req, {
    eventType: EVENTS.SECURITY_LOG_VIEWED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Security log viewed (${total} matching entries).`,
    metadata: { filters: where, page, limit },
  });

  res.json({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    entries,
  });
};

/**
 * GET /security-logs/event-types
 *
 * Populates the filter dropdown from what has actually been recorded, rather
 * than from the full catalogue, so the list reflects this deployment.
 */
export const listEventTypes = async (req, res) => {
  const grouped = await prisma.securityLog.groupBy({
    by: ["eventType"],
    _count: { eventType: true },
    orderBy: { eventType: "asc" },
  });

  res.json({
    eventTypes: grouped.map((row) => ({
      eventType: row.eventType,
      count: row._count.eventType,
    })),
  });
};

/**
 * GET /security-logs/summary
 *
 * The strip at the top of the admin log page: what has been happening in the
 * last 24 hours, and what needs attention now.
 */
export const getSecurityLogSummary = async (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [byOutcome, bySeverity, failedLogins, accessDenials, lockouts, validationFailures, lockedAccounts] =
    await Promise.all([
      prisma.securityLog.groupBy({
        by: ["outcome"],
        where: { createdAt: { gte: since } },
        _count: { outcome: true },
      }),
      prisma.securityLog.groupBy({
        by: ["severity"],
        where: { createdAt: { gte: since } },
        _count: { severity: true },
      }),
      prisma.securityLog.count({
        where: { createdAt: { gte: since }, eventType: EVENTS.LOGIN_FAILURE },
      }),
      prisma.securityLog.count({
        where: { createdAt: { gte: since }, eventType: { startsWith: "ACCESS_DENIED" } },
      }),
      prisma.securityLog.count({
        where: { createdAt: { gte: since }, eventType: EVENTS.ACCOUNT_LOCKED },
      }),
      prisma.securityLog.count({
        where: { createdAt: { gte: since }, eventType: EVENTS.INPUT_VALIDATION_FAILURE },
      }),
      prisma.userAccount.count({ where: { lockedUntil: { gt: new Date() } } }),
    ]);

  res.json({
    windowHours: 24,
    outcomes: Object.fromEntries(byOutcome.map((row) => [row.outcome, row._count.outcome])),
    severities: Object.fromEntries(bySeverity.map((row) => [row.severity, row._count.severity])),
    failedLogins,
    accessDenials,
    lockouts,
    validationFailures,
    currentlyLockedAccounts: lockedAccounts,
  });
};
