import React from "react";

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = "",
  footer,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden ${className}`}
    >
      {(title || description) && (
        <div className="p-6 pb-4">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="p-6 pt-0">{children}</div>
      {footer && (
        <div className="p-6 pt-0 flex items-center border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
