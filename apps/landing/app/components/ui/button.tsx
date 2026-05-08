/**
 * [READING_LIST_BUTTON] ShadCN-aligned button primitives, locally owned.
 *
 * Two surfaces: filled (walnut on parchment) and ghost (parchment with walnut
 * outline). Both flatten to a square corner — the brand never uses pill or
 * radius-heavy buttons. This file is an _exception_ to the ShadCN baseline
 * (we hand-write to keep the class footprint tiny and the design tokens local).
 * The exception is documented in /DESIGN.md section 3.
 */

import * as React from "react";
import { cn } from "@/lib/cn";

type Size = "default" | "sm" | "lg";
type Variant = "default" | "ghost";

const sizeClass: Record<Size, string> = {
  sm: "h-10 px-3 text-[13px]",
  default: "h-11 px-4 text-[14.5px]",
  lg: "h-12 px-5 text-[15px]"
};

const variantClass: Record<Variant, string> = {
  default:
    "border border-walnut bg-walnut text-parchment hover:bg-marginalia hover:border-marginalia",
  ghost:
    "border border-walnut bg-transparent text-walnut hover:bg-walnut hover:text-parchment"
};

const baseClass =
  "inline-flex items-center justify-center gap-2 font-sans font-medium rounded-none transition-colors duration-100 focus-visible:outline focus-visible:outline-1.5 focus-visible:outline-offset-2 focus-visible:outline-gilt disabled:opacity-50 disabled:cursor-not-allowed";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  variant?: Variant;
};

export function Button({
  className,
  size = "default",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClass, sizeClass[size], variantClass[variant], className)}
      {...props}
    />
  );
}

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: Size;
  variant?: Variant;
};

export function ButtonAnchor({
  className,
  size = "default",
  variant = "default",
  ...props
}: AnchorProps) {
  return (
    <a
      className={cn(baseClass, sizeClass[size], variantClass[variant], className)}
      {...props}
    />
  );
}
