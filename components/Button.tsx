import React from "react";
import clsx from "clsx";
import { ArrowPathIcon } from "@heroicons/react/16/solid";

type Variant = "contained" | "outlined" | "text";
type Color = "primary" | "secondary" | "error" | "warning" | "success";
type Size = "xs" | "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  variant?: Variant;
  color?: Color;
  size?: Size;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

const colorClasses: Record<
  Color,
  { contained: string; outlined: string; text: string }
> = {
  primary: {
    contained:
      "bg-brand-primary text-white hover:bg-brand-primary-dark active:bg-brand-primary-darker border border-transparent",
    outlined:
      "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5 active:bg-brand-primary/20",
    text: "text-brand-primary hover:bg-brand-primary-lighter/20 active:bg-brand-primary-lighter",
  },
  secondary: {
    contained:
      "bg-brand-secondary text-white hover:bg-brand-secondary-dark active:bg-brand-secondary-darker border border-transparent",
    outlined:
      "border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary/5 active:bg-brand-secondary/20",
    text: "text-brand-secondary hover:bg-brand-secondary-lighter/20 active:bg-brand-secondary-lighter",
  },
  error: {
    contained:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent",
    outlined:
      "border-2 border-red-600 text-red-600 hover:bg-red-600/5 active:bg-red-600/20",
    text: "text-red-600 hover:bg-red-100 active:bg-red-200",
  },
  warning: {
    contained:
      "bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 border border-transparent",
    outlined:
      "border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600/5 active:bg-yellow-600/20",
    text: "text-yellow-600 hover:bg-yellow-100 active:bg-yellow-200",
  },
  success: {
    contained:
      "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 border border-transparent",
    outlined:
      "border border-green-600 text-green-600 hover:bg-green-600/5 active:bg-green-600/20",
    text: "text-green-600 hover:bg-green-100 active:bg-green-200",
  },
};

const sizeClasses: Record<
  Size,
  { button: string; icon: string }
> = {
  xs: {
    button: "px-1 py-0.5 text-xs",
    icon: "h-3 w-3",
  },
  sm: {
    button: "px-2.5 py-1.5 text-sm",
    icon: "h-4 w-4",
  },
  md: {
    button: "px-4 py-2 text-base",
    icon: "h-5 w-5",
  },
  lg: {
    button: "px-5 py-3 text-lg",
    icon: "h-6 w-6",
  },
};

export default function Button({
  children,
  variant = "contained",
  color = "primary",
  size = "md",
  icon,
  className,
  isLoading,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "justify-center disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none",
        colorClasses[color][variant],
        sizeClasses[size].button,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <ArrowPathIcon
          className={clsx(sizeClasses[size].icon, "animate-spin text-primary-main")}
        />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}

      {children}
    </button>
  );
}
