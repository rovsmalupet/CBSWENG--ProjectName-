import { apiDelete, apiGet, apiPatch, apiPost } from "../config/api.js";

export const MAX_BOOKMARK_NOTE_LENGTH = 280;

export const hasBookmark = (entries, projectId) =>
  entries.some((entry) => entry.projectId === projectId);

export const loadBookmarks = () => apiGet("/bookmarks");

export const addBookmark = (projectId, note = "") =>
  apiPost("/bookmarks", { projectId, note });

export const removeBookmark = (bookmarkId) =>
  apiDelete(`/bookmarks/${bookmarkId}`);

export const updateBookmarkNote = (bookmarkId, note) =>
  apiPatch(`/bookmarks/${bookmarkId}`, { note });
