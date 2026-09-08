import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
};

const variants = {
  primary: "bg-maroon text-white shadow-soft hover:bg-[#5c1d2b]",
  secondary: "bg-white text-charcoal border border-gold/30 hover:border-gold",
  ghost: "bg-transparent text-charcoal hover:bg-white/70",
  danger: "bg-white text-maroon border border-maroon/30 hover:border-maroon"
};

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
