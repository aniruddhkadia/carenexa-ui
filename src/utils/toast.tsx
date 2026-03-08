import toast from "react-hot-toast";
import { XCircle, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import React from "react";

/**
 * Custom Confirmation Toast
 * Instead of window.confirm
 */
export const confirmToast = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-5 border border-slate-100`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <HelpCircle size={22} />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
              Confirmation Required
            </p>
            <p className="mt-1 text-sm text-slate-500 font-medium">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              if (onCancel) onCancel();
              toast.dismiss(t.id);
            }}
            className="flex-1 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              toast.dismiss(t.id);
            }}
            className="flex-1 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-xl transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    ),
    { duration: Infinity },
  );
};

/**
 * Custom Prompt Toast
 * Instead of window.prompt
 */
export const promptToast = (
  message: string,
  placeholder: string = "Type here...",
  onConfirm: (value: string) => void,
  onCancel?: () => void,
) => {
  let value = "";

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-6 border border-slate-100`}
      >
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
              <AlertCircle size={22} />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
              Input Required
            </p>
            <p className="mt-1 text-sm text-slate-500 font-medium">{message}</p>
          </div>
        </div>

        <input
          autoFocus
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mb-6"
          placeholder={placeholder}
          onChange={(e) => {
            value = e.target.value;
          }}
        />

        <div className="flex gap-3">
          <button
            onClick={() => {
              if (onCancel) onCancel();
              toast.dismiss(t.id);
            }}
            className="flex-1 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(value);
              toast.dismiss(t.id);
            }}
            className="flex-1 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 rounded-xl transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    ),
    { duration: Infinity },
  );
};

/**
 * Custom Alert Toast
 * Instead of window.alert
 */
export const alertToast = (
  message: string,
  type: "info" | "error" | "warning" = "info",
) => {
  if (type === "error") {
    toast.error(message);
  } else if (type === "warning") {
    toast(message, { icon: "⚠️" });
  } else {
    toast(message, { icon: "ℹ️" });
  }
};
