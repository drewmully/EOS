import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = "", ...rest }: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        className={[
          "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800",
          "placeholder:text-gray-400",
          "transition-colors duration-100",
          "hover:border-gray-300",
          "focus:outline-none focus:border-gray-400 focus:bg-white",
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
        <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={[
          "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 resize-y min-h-[48px]",
          "placeholder:text-gray-400",
          "transition-colors duration-100",
          "hover:border-gray-300",
          "focus:outline-none focus:border-gray-400 focus:bg-white",
          className,
        ].join(" ")}
        {...rest}
      />
    </div>
  );
}
