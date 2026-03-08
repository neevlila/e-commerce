import React from "react";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactElement;
  title: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  gradientLight?: { from: string; via: string; to: string };
  gradientDark?: { from: string; via: string; to: string };
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  icon,
  title,
  subtitle,
  size = "md",
  gradientLight,
  gradientDark,
  ...props
}) => {
  const sizes = {
    sm: "px-4 py-2.5 rounded-full",
    md: "px-5 py-3.5 rounded-full",
    lg: "px-7 py-5 rounded-full",
  };

  return (
    <button
      {...props}
      className={`group relative overflow-hidden border-2 cursor-pointer transition-all duration-300 ease-out
                  hover:scale-[1.01] hover:-translate-y-0.5 active:scale-95
                  ${sizes[size]}
                  bg-white border-indigo-400 shadow-sm shadow-indigo-100 hover:border-indigo-500 hover:shadow-indigo-200
                  dark:bg-gradient-to-r dark:from-[#070e41] dark:to-[#263381]
                  dark:border-[#656fe2] dark:shadow-none dark:hover:border-[#8090f0] w-full`}
    >
      {/* Shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none rounded-full" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center gap-3">
        {/* Icon */}
        <div className="p-1.5 rounded-full bg-indigo-50 dark:bg-white/10 group-hover:bg-indigo-100 dark:group-hover:bg-white/20 transition-all duration-300 flex-shrink-0">
          {React.cloneElement(icon, {
            className: "w-5 h-5 transition-all duration-300 group-hover:scale-110",
          })}
        </div>

        {/* Text */}
        <p className="text-gray-800 dark:text-white font-semibold text-sm group-hover:text-indigo-700 dark:group-hover:text-white/90 transition-colors duration-300">
          {title}
        </p>
      </div>
    </button>
  );
};