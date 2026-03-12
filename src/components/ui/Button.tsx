import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950",
  secondary:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100",
  ghost:
    "text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100",
  danger:
    "bg-white text-red-600 border border-gray-200 hover:bg-red-50 hover:border-red-300 active:bg-red-100",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Button({ children, variant = "primary", size = "md", icon, className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg cursor-pointer",
        "transition-colors duration-100",
        variants[variant],
        size === "sm"
          ? "text-xs px-3 py-1.5"
          : "text-sm px-4 py-2",
        className,
      ].join(" ")}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
