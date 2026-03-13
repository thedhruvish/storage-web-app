import React from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fill?: string;
  initialBgColor?: string;
  text?: string;
  direction?: "vertical" | "horizontal" | "ink" | "dual" | "corner";
  duration?: number | string;
  delay?: number | string;
  icon?: LucideIcon;
}

const LiquidButton = ({
  children,
  className,
  fill = "bg-indigo-600",
  initialBgColor = "bg-neutral-950",
  text = "text-white",
  direction = "vertical",
  duration = 400,
  delay = 0,
  icon: Icon,
  ...props
}: LiquidButtonProps) => {
  // Check if initialBgColor is a tailwind class (starts with bg-) or a custom color
  const isTailwindBase = initialBgColor?.startsWith("bg-");

  // Check if text is a hex/rgb/hsl color
  const isTextColor =
    text?.startsWith("#") || text?.startsWith("rgb") || text?.startsWith("hsl");

  // Base classes
  const baseClasses = cn(
    "group relative cursor-pointer overflow-hidden rounded-full border border-neutral-800 px-8 py-3 font-semibold transition-all active:scale-95 hover:border-neutral-600 hover:shadow-lg",
    isTailwindBase ? initialBgColor : "",
    className
  );

  const baseStyle = {
    ...(!isTailwindBase ? { backgroundColor: initialBgColor } : {}),
  };

  // Check if fill is a tailwind class (starts with bg-) or a custom color
  const isTailwindClass = fill?.startsWith("bg-");

  // Convert number props to ms strings if needed
  const transitionStyle = {
    transitionDuration:
      typeof duration === "number" ? `${duration}ms` : duration,
    transitionDelay: typeof delay === "number" ? `${delay}ms` : delay,
    ...(!isTailwindClass ? { backgroundColor: fill } : {}),
  };

  const textStyle = {
    transitionDuration:
      typeof duration === "number" ? `${duration}ms` : duration,
    transitionDelay: typeof delay === "number" ? `${delay}ms` : delay,
    ...(isTextColor ? { color: text } : {}),
  };

  // Helper to render the background animation layer based on direction
  const renderFill = () => {
    // Common styles for the filling layer
    const fillBase = cn(
      "absolute z-0 transition-all ease-[cubic-bezier(0.4,0,0.2,1)]",
      isTailwindClass ? fill : ""
    );

    switch (direction) {
      case "horizontal":
        return (
          <div
            style={transitionStyle}
            className={cn(
              fillBase,
              "inset-0 h-full w-full -translate-x-[102%] group-hover:translate-x-0"
            )}
          />
        );

      case "ink":
        return (
          <div
            style={transitionStyle}
            className={cn(
              fillBase,
              "left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2 rounded-full group-hover:h-100 group-hover:w-100"
            )}
          />
        );

      case "dual":
        return (
          <>
            <div
              style={transitionStyle}
              className={cn(
                fillBase,
                "inset-x-0 top-0 h-[55%] w-full -translate-y-[102%] group-hover:translate-y-0"
              )}
            />
            <div
              style={transitionStyle}
              className={cn(
                fillBase,
                "inset-x-0 bottom-0 h-[55%] w-full translate-y-[102%] group-hover:translate-y-0"
              )}
            />
          </>
        );

      case "corner":
        return (
          <div
            style={transitionStyle}
            className={cn(
              fillBase,
              "-left-10 -top-10 h-20 w-20 scale-0 rounded-full group-hover:scale-[12]"
            )}
          />
        );

      case "vertical":
      default:
        return (
          <div
            style={transitionStyle}
            className={cn(
              fillBase,
              "inset-0 h-full w-full translate-y-[102%] group-hover:translate-y-0"
            )}
          />
        );
    }
  };

  return (
    <button className={baseClasses} style={baseStyle} {...props}>
      {/* Content Layer: Higher z-index to sit ON TOP of the fill */}
      <span
        style={textStyle}
        className={cn(
          "relative z-10 flex items-center justify-center gap-2 transition-colors ease-in-out",
          !isTextColor ? text : ""
        )}
      >
        {Icon && <Icon size={18} />}
        {children}
      </span>
      {renderFill()}
    </button>
  );
};

export default LiquidButton;
