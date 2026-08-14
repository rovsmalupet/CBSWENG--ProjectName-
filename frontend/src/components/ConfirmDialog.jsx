import { useEffect, useId, useRef } from "react";

import "../css/ConfirmDialog.css";

const ICONS = {
  danger: "!",
  warning: "!",
  success: "✓",
  info: "i",
};

/**
 * Reusable confirmation and status dialog for administrator actions.
 *
 * When `showCancel` is false, the dialog acts as a styled status notice with
 * one acknowledgement button. Destructive confirmations focus Cancel first
 * so pressing Enter immediately cannot trigger the destructive action.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  busyLabel = "Working…",
  cancelLabel = "Cancel",
  tone = "info",
  showCancel = true,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);
  const onCancelRef = useRef(onCancel);
  const busyRef = useRef(busy);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const initialControl = showCancel ? cancelRef.current : confirmRef.current;
    initialControl?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        onCancelRef.current?.();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const controls = Array.from(
        dialog.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (controls.length === 0) return;

      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, showCancel]);

  if (!open) return null;

  const safeTone = Object.hasOwn(ICONS, tone) ? tone : "info";
  const dismiss = () => {
    if (!busy) onCancel?.();
  };

  return (
    <div
      className="confirm-dialog-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        className={`confirm-dialog confirm-dialog--${safeTone}`}
        role={showCancel ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={busy || undefined}
      >
        <div className="confirm-dialog-heading">
          <span className="confirm-dialog-icon" aria-hidden="true">
            {ICONS[safeTone]}
          </span>
          <div>
            <h2 id={titleId}>{title}</h2>
            <p id={descriptionId}>{message}</p>
          </div>
        </div>

        <div className="confirm-dialog-actions">
          {showCancel && (
            <button
              ref={cancelRef}
              type="button"
              className="confirm-dialog-cancel"
              onClick={dismiss}
              disabled={busy}
            >
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmRef}
            type="button"
            className="confirm-dialog-confirm"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
