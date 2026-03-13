import React, { useState } from "react";
import { cn } from "@/lib/utils";

type SplashButtonStatus = "success" | "error" | "warning" | "info" | "neutral";

interface SplashButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: SplashButtonStatus;
}

const SplashButton = ({
  children,
  status = "success",
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props
}: SplashButtonProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    if (onClick) onClick(e);
  };

  const statusConfig = {
    success: {
      base: "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-100",
      hover:
        "hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-700 dark:hover:text-white",
      dot: "bg-emerald-500/60 group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_rgba(52,211,153,0.6)]",
      splash: "bg-emerald-500/20",
    },
    error: {
      base: "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-100",
      hover:
        "hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-700 dark:hover:text-white",
      dot: "bg-rose-500/60 group-hover:bg-rose-400 group-hover:shadow-[0_0_8px_rgba(251,113,133,0.6)]",
      splash: "bg-rose-500/20",
    },
    warning: {
      base: "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-100",
      hover:
        "hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-white",
      dot: "bg-amber-500/60 group-hover:bg-amber-400 group-hover:shadow-[0_0_8px_rgba(251,191,36,0.6)]",
      splash: "bg-amber-500/20",
    },
    info: {
      base: "bg-cyan-500/5 border-cyan-500/20 text-cyan-600 dark:text-cyan-100",
      hover:
        "hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-700 dark:hover:text-white",
      dot: "bg-cyan-500/60 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.6)]",
      splash: "bg-cyan-500/20",
    },
    neutral: {
      base: "bg-slate-500/5 border-slate-500/20 text-slate-600 dark:text-slate-300",
      hover:
        "hover:bg-slate-500/10 hover:border-slate-500/40 hover:text-slate-900 dark:hover:text-white",
      dot: "bg-slate-500/60 group-hover:bg-slate-400 group-hover:shadow-[0_0_8px_rgba(148,163,184,0.6)]",
      splash: "bg-slate-500/20",
    },
  };

  const currentConfig = statusConfig[status] || statusConfig.neutral;

  return (
    <>
      <style>
        {`
                    @keyframes splash-burst {
                        0% { transform: scale(0.8); opacity: 1; }
                        100% { transform: scale(2); opacity: 0; }
                    }
                    .animate-splash {
                        animation: splash-burst 0.6s ease-out forwards;
                    }
                `}
      </style>
      <button
        type={type}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "group cursor-pointer relative flex items-center justify-center gap-3 px-8 py-3 border rounded-md overflow-hidden transition-all duration-200 ease-out font-mono text-sm tracking-widest uppercase active:translate-y-[1px] focus:outline-none focus:ring-1 focus:ring-slate-400/30 focus:ring-offset-1 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:active:translate-y-0",
          !disabled
            ? cn(currentConfig.base, currentConfig.hover)
            : "bg-slate-800/50 border-slate-700/50 text-slate-600",
          className
        )}
        {...props}
      >
        {isAnimating && (
          <span
            className={cn(
              "absolute inset-0 rounded-md pointer-events-none animate-splash z-0",
              currentConfig.splash
            )}
          />
        )}

        <span className=' relative z-10 flex items-center justify-center w-3 h-3'>
          {/* <span
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300 ease-out",
              !disabled ? currentConfig.dot : "bg-slate-700"
            )}
          /> */}
        </span>

        <span className='relative z-10 select-none'>{children}</span>

        <div className='absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-300 pointer-events-none rounded-md z-10' />
      </button>
    </>
  );
};
export default SplashButton;
