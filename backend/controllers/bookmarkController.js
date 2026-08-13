import prisma from "../prisma/client.js";
import { conflict } from "../errors/AppError.js";
import { EVENTS, OUTCOME, SEVERITY, logSecurityEvent } from "../security/securityLog.js";

const bookmarkFields = {
  id: true,
  projectId: true,
  note: true,
  createdAt: true,
  updatedAt: true,
};

// The account id always comes from the freshly authenticated session. No
// caller-controlled owner id appears in any bookmark request schema.
export const listBookmarks = async (req, res) => {
  const bookmarks = await prisma.donorBookmark.findMany({
    where: {
      accountId: req.user.accountId,
      project: { overallStatus: "Approved" },
    },
    select: bookmarkFields,
    orderBy: { updatedAt: "desc" },
  });

  res.json(bookmarks);
};

export const createBookmark = async (req, res) => {
  let bookmark;
  try {
    bookmark = await prisma.donorBookmark.create({
      data: {
        accountId: req.user.accountId,
        projectId: req.body.projectId,
        note: req.body.note ?? "",
      },
      select: bookmarkFields,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw conflict("You have already bookmarked this project.");
    }
    throw error;
  }

  await logSecurityEvent(req, {
    eventType: EVENTS.BOOKMARK_CREATED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "A donor created a private project bookmark.",
    targetType: "DonorBookmark",
    targetId: bookmark.id,
    metadata: { projectId: bookmark.projectId },
  });

  res.status(201).json(bookmark);
};

export const updateBookmark = async (req, res) => {
  const bookmark = await prisma.donorBookmark.update({
    where: { id: req.resource.id },
    data: { note: req.body.note },
    select: bookmarkFields,
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.BOOKMARK_UPDATED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "A donor updated a private bookmark note.",
    targetType: "DonorBookmark",
    targetId: bookmark.id,
    metadata: { projectId: bookmark.projectId },
  });

  res.json(bookmark);
};

export const deleteBookmark = async (req, res) => {
  await prisma.donorBookmark.delete({ where: { id: req.resource.id } });

  await logSecurityEvent(req, {
    eventType: EVENTS.BOOKMARK_DELETED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "A donor removed a private project bookmark.",
    targetType: "DonorBookmark",
    targetId: req.resource.id,
    metadata: { projectId: req.resource.projectId },
  });

  res.status(204).send();
};
