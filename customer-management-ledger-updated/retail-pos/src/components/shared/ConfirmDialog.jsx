import { AlertTriangle } from "lucide-react";

import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm action",
  description = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  destructive = true,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={(
        <>
          <button type="button" onClick={onClose} disabled={isLoading} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium dark:border-slate-700">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} disabled={isLoading} className={`h-10 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50 ${destructive ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </>
      )}
    >
      <div className="flex gap-4">
        <div className="h-fit rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950"><AlertTriangle className="size-5" /></div>
        <p className="pt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </Modal>
  );
}
