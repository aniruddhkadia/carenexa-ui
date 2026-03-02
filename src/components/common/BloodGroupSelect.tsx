import React from "react";

interface BloodGroupSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const BLOOD_GROUPS = [
  "O+",
  "O-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
] as const;

const BloodGroupSelect = React.forwardRef<
  HTMLSelectElement,
  BloodGroupSelectProps
>(({ label, error, helperText, className = "", ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white dark:bg-slate-800 dark:text-white appearance-none cursor-pointer ${
          error ? "border-red-500 focus:ring-red-200" : ""
        } ${className}`}
        {...props}
      >
        <option value="">Select Blood Group</option>
        {BLOOD_GROUPS.map((bg) => (
          <option key={bg} value={bg}>
            {bg}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

BloodGroupSelect.displayName = "BloodGroupSelect";

export default BloodGroupSelect;
