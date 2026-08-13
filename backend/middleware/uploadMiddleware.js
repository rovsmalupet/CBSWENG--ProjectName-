/**
 * uploadMiddleware.js — file upload handling. [CSSECDV 2.3.1, 2.3.2, 2.3.3]
 *
 * Four changes from the original:
 *
 *  1. SIZE. 50 MB → 10 MB. The old ceiling let a handful of requests exhaust
 *     the disk of a small deployment.
 *
 *  2. NAME. The stored filename is now a generated UUID. It used to be built
 *     from `file.originalname`, so a name like "../../server.js" or a double
 *     extension such as "invoice.pdf.exe" was partly attacker-controlled. The
 *     original name is still kept in the database for display; it just never
 *     touches the filesystem path.
 *
 *  3. CONTENT. The MIME type in a multipart request is supplied by the client
 *     and was the only check. We now also require the extension to be allowed
 *     AND the file's actual magic bytes to match what it claims to be. An
 *     executable renamed to .pdf is rejected.
 *
 *  4. REJECTION, not repair. A filename that does not match the safe pattern is
 *     refused rather than rewritten into something acceptable — silently
 *     accepting a modified version of what was sent is what 2.3.1 forbids.
 */

import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { fileTypeFromFile } from "file-type";

import config from "../security/env.js";
import { AppError } from "../errors/AppError.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Allowed types, keyed by the MIME the client declares.
 *
 * `magic` lists the MIME types the file-type library may detect for a file of
 * this kind. `null` means the format has no reliable signature — plain text and
 * CSV are just bytes — so those are accepted on extension alone and are
 * harmless as long as they are never executed or served inline.
 */
const ALLOWED_TYPES = {
  "image/jpeg": { extensions: [".jpg", ".jpeg"], magic: ["image/jpeg"] },
  "image/png": { extensions: [".png"], magic: ["image/png"] },
  "image/gif": { extensions: [".gif"], magic: ["image/gif"] },
  "image/webp": { extensions: [".webp"], magic: ["image/webp"] },
  "application/pdf": { extensions: [".pdf"], magic: ["application/pdf"] },
  "application/msword": { extensions: [".doc"], magic: ["application/x-cfb"] },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extensions: [".docx"],
    // Office Open XML files are ZIP containers; detection reports either.
    magic: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip",
    ],
  },
  "application/vnd.ms-excel": { extensions: [".xls"], magic: ["application/x-cfb"] },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    extensions: [".xlsx"],
    magic: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/zip",
    ],
  },
  "text/plain": { extensions: [".txt"], magic: null },
};

/** Conservative: letters, digits, space, dot, dash, underscore. */
const SAFE_FILENAME = /^[A-Za-z0-9._ -]{1,255}$/;

/**
 * Remove the file created for the current request. This is intentionally
 * idempotent so validation, content verification, and the terminal error
 * handler can all call it without coordinating who noticed the failure first.
 */
export const removeUploadedFile = async (file) => {
  if (!file?.path) return;
  await fs.promises.unlink(file.path).catch(() => {});
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // The client's name is never used to build the path. Only the extension is
    // carried across, and it has already been checked against the allowlist.
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const declared = ALLOWED_TYPES[file.mimetype];
  if (!declared) {
    return cb(new AppError("That type of file is not accepted.", 400, "UNSUPPORTED_FILE_TYPE"));
  }

  if (!SAFE_FILENAME.test(file.originalname)) {
    return cb(
      new AppError(
        "That file name contains characters we cannot accept. Please rename it using letters, numbers, spaces, dots, dashes, or underscores.",
        400,
        "UNSAFE_FILENAME",
      ),
    );
  }

  const extension = path.extname(file.originalname).toLowerCase();
  if (!declared.extensions.includes(extension)) {
    // Catches "report.pdf.exe" and any other mismatch between the declared type
    // and the visible extension.
    return cb(
      new AppError(
        "The file extension does not match the type of file it claims to be.",
        400,
        "EXTENSION_MISMATCH",
      ),
    );
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxUploadBytes, // 10 MB
    files: 1,
    fields: 30,
    // Guards against a deeply-nested-field-name denial of service.
    fieldNameSize: 200,
    fieldSize: 100 * 1024,
  },
});

/**
 * Confirm the bytes on disk match the type the client declared.
 *
 * Runs AFTER multer, because the file has to exist before it can be read. If
 * the check fails the file is deleted immediately — leaving a rejected upload
 * on disk would defeat the purpose.
 *
 * Mount on any route that accepts a file.
 */
export const verifyUploadedFile = async (req, res, next) => {
  if (!req.file) return next();

  const declared = ALLOWED_TYPES[req.file.mimetype];

  // Formats with no reliable signature are accepted on extension alone.
  if (!declared?.magic) return next();

  let detected = null;
  try {
    detected = await fileTypeFromFile(req.file.path);
  } catch {
    detected = null;
  }

  if (!detected || !declared.magic.includes(detected.mime)) {
    await removeUploadedFile(req.file);

    await logSecurityEvent(req, {
      eventType: EVENTS.INPUT_VALIDATION_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.CRITICAL,
      message:
        "Upload rejected: the file's actual content does not match the type it was declared as.",
      metadata: {
        declaredMimeType: req.file.mimetype,
        detectedMimeType: detected?.mime ?? "unrecognised",
      },
    });

    const error = new AppError(
      "That file's contents do not match its type. Please upload a genuine file of the type you selected.",
      400,
      "FILE_CONTENT_MISMATCH",
    );
    // The specific attempt was already recorded above; the terminal handler
    // should create the response without writing a duplicate audit event.
    error.validationLogged = true;
    return next(error);
  }

  return next();
};

/**
 * Translate multer's own errors into generic AppErrors.
 *
 * Without this, multer's raw message ("File too large", "Unexpected field")
 * reaches the client through the error handler — minor, but it is internal
 * library text rather than something we chose to say. [2.4.1]
 */
export const handleUploadErrors = async (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    await removeUploadedFile(req.file);
    const messages = {
      LIMIT_FILE_SIZE: `That file is too large. The maximum size is ${Math.round(config.maxUploadBytes / (1024 * 1024))} MB.`,
      LIMIT_FILE_COUNT: "Please upload one file at a time.",
      LIMIT_UNEXPECTED_FILE: "That file was not expected here.",
      LIMIT_FIELD_COUNT: "The form contained too many fields.",
      LIMIT_FIELD_VALUE: "One of the form fields was too long.",
    };
    return next(
      new AppError(messages[err.code] ?? "That file could not be accepted.", 400, "UPLOAD_REJECTED"),
    );
  }

  // File-filter errors are AppErrors rather than MulterErrors, but multer may
  // already have opened a temporary file before a later multipart error.
  if (
    err instanceof AppError &&
    ["UNSUPPORTED_FILE_TYPE", "UNSAFE_FILENAME", "EXTENSION_MISMATCH", "FILE_CONTENT_MISMATCH"].includes(
      err.code,
    )
  ) {
    await removeUploadedFile(req.file);
  }
  return next(err);
};

export default upload;
