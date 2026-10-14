import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-600 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-leaf-700 text-white shadow-sm shadow-leaf-900/10 hover:bg-leaf-800",
  secondary:
    "border border-leaf-200 bg-white text-ink hover:border-leaf-300 hover:bg-leaf-50",
  ghost: "text-ink-soft hover:bg-leaf-100/60 hover:text-ink",
  inverse:
    "bg-cream text-leaf-900 hover:bg-white focus-visible:outline-cream",
} as const;

const sizes = {
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
} as const;

type ButtonStyleOptions = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: ButtonStyleOptions = {}) {
  return cn(base, variants[variant], sizes[size], className);
}
