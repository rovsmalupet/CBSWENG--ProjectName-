/**
 * owners.js — object-level authorization ("is this row yours?").
 *
 * CSSECDV 2.2.2.
 *
 * Role checks answer "may an NGO edit projects?". They cannot answer "may THIS
 * NGO edit THIS project?" — and that gap is where the real holes were. Before
 * this file, `PUT /posts/:postId` and `DELETE /posts/:postId` were correctly
 * restricted to the `ngo` role and then never checked whose project it was, so
 * any organization could rewrite or delete any other organization's work. The
 * same gap existed on document downloads, payment records, refund history, and
 * `POST /refunds/issue`, where it moved money.
 *
 * Ownership is declared in the policy table next to the role list, so the
 * decision still happens in one component (2.2.1); only the lookup lives here.
 *
 * CONTRACT
 *   Every resolver returns { allowed: boolean, resource?: object }.
 *   A resolver must never throw — accessControl.js converts an exception into a
 *   denial, but a resolver that returns `true` on error would fail *open*,
 *   which is the failure mode 2.2.2 exists to prevent. Each one is written to
 *   return `{ allowed: false }` on anything unexpected.
 */

import prisma from "../prisma/client.js";

const DENY = { allowed: false };

/** Roles are trusted here because accessControl.js has already verified them. */
const isAdmin = (req) => req.user?.role === "admin";

/* ═══════════════════════════════════════════════════════════════════════════
 * POSTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The requesting organization must own the post.
 * Used for edit, delete, contribution review, and document upload.
 */
export const post = async (req) => {
  const postId = req.params.postId ?? req.params.id;
  if (!postId) return DENY;

  const record = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, orgId: true, overallStatus: true, endDate: true, projectName: true },
  });
  if (!record) return DENY;

  if (isAdmin(req)) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/**
 * Read access to a single post.
 *
 * An Approved post is public-facing content — every signed-in user may read it,
 * which is the whole purpose of the platform. Anything else (Pending,
 * Unapproved, Edited, Deleted) is visible only to the owning organization and
 * to administrators. Previously any authenticated user could read every post in
 * any state simply by guessing or harvesting an id, including drafts an
 * organization had never published and posts it had deleted.
 */
export const postVisible = async (req) => {
  const postId = req.params.postId ?? req.params.id;
  if (!postId) return DENY;

  const record = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, orgId: true, overallStatus: true },
  });
  if (!record) return DENY;

  if (record.overallStatus === "Approved") return { allowed: true, resource: record };
  if (isAdmin(req)) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DOCUMENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Listing a post's documents follows the post's own visibility rule. */
export const documentsForPost = postVisible;

/** Downloading one document, resolved through its post. */
export const document = async (req) => {
  const { documentId } = req.params;
  if (!documentId) return DENY;

  const record = await prisma.documentUpload.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      filePath: true,
      fileName: true,
      mimeType: true,
      post: { select: { id: true, orgId: true, overallStatus: true } },
    },
  });
  if (!record?.post) return DENY;

  if (record.post.overallStatus === "Approved") return { allowed: true, resource: record };
  if (isAdmin(req)) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.post.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/** Deleting a document requires ownership of its post regardless of post state. */
export const documentOwned = async (req) => {
  const { documentId } = req.params;
  if (!documentId) return DENY;

  const record = await prisma.documentUpload.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      filePath: true,
      fileName: true,
      post: { select: { id: true, orgId: true } },
    },
  });
  if (!record?.post) return DENY;

  if (isAdmin(req)) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.post.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/**
 * Uploading a document names its post in the BODY rather than the path, so the
 * id is read from there. Same rule: you may only upload to your own project.
 */
export const postFromBody = async (req) => {
  const postId = req.body?.postId;
  if (!postId || typeof postId !== "string") return DENY;

  const record = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, orgId: true, overallStatus: true },
  });
  if (!record) return DENY;

  if (isAdmin(req)) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * PAYMENTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * A payment is visible to the person who made it, to the organization that
 * received it, and to administrators. Previously any authenticated user could
 * read any payment row by id, exposing who donated what to whom.
 */
export const payment = async (req) => {
  const { paymentId } = req.params;
  if (!paymentId) return DENY;

  const record = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      userId: true,
      postId: true,
      post: { select: { id: true, orgId: true } },
    },
  });
  if (!record) return DENY;

  if (isAdmin(req)) return { allowed: true, resource: record };
  if (record.userId === req.user?.id) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.post?.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/** Payment or refund history for a post — owning organization or admin only. */
export const paymentsForPost = async (req) => {
  const postId = req.params.postId ?? req.params.projectId;
  if (!postId) return DENY;

  const record = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, orgId: true },
  });
  if (!record) return DENY;

  if (isAdmin(req)) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/** A donor's own payment history. Admins may also read it. */
export const donorPayments = async (req) => {
  const { donorId } = req.params;
  if (!donorId) return DENY;
  if (isAdmin(req)) return { allowed: true };
  return donorId === req.user?.id ? { allowed: true } : DENY;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * REFUNDS
 * ═══════════════════════════════════════════════════════════════════════════ */

export const refund = async (req) => {
  const { refundId } = req.params;
  if (!refundId) return DENY;

  const record = await prisma.refund.findUnique({
    where: { id: refundId },
    select: {
      id: true,
      paymentId: true,
      payment: {
        select: { id: true, userId: true, post: { select: { id: true, orgId: true } } },
      },
    },
  });
  if (!record) return DENY;

  if (isAdmin(req)) return { allowed: true, resource: record };
  if (record.payment?.userId === req.user?.id) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.payment?.post?.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/**
 * Issuing a refund. The payment is named in the BODY.
 *
 * This was the most serious hole in the application: the route was restricted
 * to `ngo` and `admin`, and then any NGO could refund any payment belonging to
 * any other organization's project.
 */
export const refundablePayment = async (req) => {
  const paymentId = req.body?.paymentId;
  if (!paymentId || typeof paymentId !== "string") return DENY;

  const record = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      userId: true,
      status: true,
      postId: true,
      refundIntentId: true,
      monetaryContribution: true,
      monetaryTransactionFee: true,
      volunteerTransactionFee: true,
      inKindTransactionFee: true,
      paymentIntentId: true,
      currency: true,
      post: { select: { id: true, orgId: true } },
    },
  });
  if (!record) return DENY;

  if (isAdmin(req)) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.post?.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * CONTRIBUTIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Confirming or declining a contribution belongs to the organization that
 * received it — this is the action that moves a project's progress totals, so
 * it must not be reachable by the donor who created the contribution.
 */
export const contributionForOrg = async (req) => {
  const { contributionId } = req.params;
  if (!contributionId) return DENY;

  const record = await prisma.contribution.findUnique({
    where: { id: contributionId },
    select: {
      id: true,
      status: true,
      type: true,
      amount: true,
      quantity: true,
      volunteerCount: true,
      inKindItemId: true,
      postId: true,
      post: { select: { id: true, orgId: true } },
    },
  });
  if (!record?.post) return DENY;

  if (isAdmin(req)) return { allowed: true, resource: record };
  if (req.user?.role === "ngo" && record.post.orgId === req.user.id) {
    return { allowed: true, resource: record };
  }
  return DENY;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * ACCOUNTS
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Guards admin-on-admin operations.
 *
 * Refuses to let an administrator disable, demote, or force-reset their OWN
 * account. Not a privacy rule — a safety interlock. Without it a single
 * misclick can leave the deployment with no usable administrator and no way in.
 * The "last remaining admin" case is enforced in the controller, where the
 * count is available.
 */
export const notSelfAccount = async (req) => {
  const targetAccountId = req.params.id;
  if (!targetAccountId) return DENY;
  if (targetAccountId === req.user?.accountId) return DENY;

  const record = await prisma.userAccount.findUnique({
    where: { id: targetAccountId },
    select: { id: true, email: true, role: true, status: true },
  });
  if (!record) return DENY;

  return { allowed: true, resource: record };
};

export default {
  post,
  postVisible,
  postFromBody,
  documentsForPost,
  document,
  documentOwned,
  payment,
  paymentsForPost,
  donorPayments,
  refund,
  refundablePayment,
  contributionForOrg,
  notSelfAccount,
};
