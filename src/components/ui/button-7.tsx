import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
  ({ label = "Back", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full",
          // Light mode: clean white with indigo border — matches Google button
          "bg-white border-2 border-indigo-400 shadow-sm shadow-indigo-100",
          // Dark mode: deep navy gradient — matches Google button
          "dark:bg-gradient-to-r dark:from-[#070e41] dark:to-[#263381] dark:border-[#656fe2] dark:shadow-none",
          "font-medium transition-all duration-300 hover:w-32 hover:border-indigo-500 dark:hover:border-[#8090f0]",
          className
        )}
        {...props}
      >
        <div className="inline-flex whitespace-nowrap opacity-0 transition-all duration-200 group-hover:-translate-x-3 group-hover:opacity-100 text-sm font-semibold text-indigo-600 dark:text-white">
          {label}
        </div>
        {/* Arrow — perfectly centered */}
        <div className="absolute right-0 top-0 bottom-0 w-[40px] flex items-center justify-center pr-0.5">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 rotate-180 text-indigo-600 dark:text-white"
          >
            <path
              d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>
    );
  }
);

BackButton.displayName = "BackButton";
