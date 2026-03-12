import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...rest }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <input
        className={[
          "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-800",
          "placeholder:text-gray-400",
          "transition-all duration-150",
          "hover:border-gray-300",
          "focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10",
          className,
        ].join(" ")}
        {...rest}
      />
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", ...rest }: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </label>
      )}
      <textarea
        className={[
          "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-gray-800 resize-y min-h-[56px]",
          "placeholder:text-gray-400",
          "transition-all duration-150",
          "hover:border-gray-300",
          "focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10",
          className,
        ].join(" ")}
        {...rest}
      />
    </div>
  );
}
