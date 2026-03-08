import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  onClick?: () => void;
}

interface TubelightNavBarProps {
  items: NavItem[];
  className?: string;
  activeTab?: string;
  onTabChange?: (name: string) => void;
}

export function TubelightNavBar({
  items,
  className,
  activeTab: externalActiveTab,
  onTabChange,
}: TubelightNavBarProps) {
  const [activeTab, setActiveTab] = useState(externalActiveTab ?? items[0].name);

  useEffect(() => {
    if (externalActiveTab) setActiveTab(externalActiveTab);
  }, [externalActiveTab]);

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-background/5 border border-border/60 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;

        return (
          <button
            key={item.name}
            onClick={() => {
              setActiveTab(item.name);
              onTabChange?.(item.name);
              item.onClick?.();
            }}
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-4 py-1.5 rounded-full transition-colors",
              "text-foreground/70 hover:text-primary",
              isActive && "text-primary"
            )}
          >
            <span className="hidden md:inline">{item.name}</span>
            <span className="md:hidden">
              <Icon size={16} strokeWidth={2.5} />
            </span>
            {isActive && (
              <motion.div
                layoutId="navbar-lamp"
                className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 30,
                }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-t-full">
                  <div className="absolute w-10 h-5 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                  <div className="absolute w-6 h-5 bg-primary/20 rounded-full blur-md -top-1" />
                  <div className="absolute w-3 h-3 bg-primary/20 rounded-full blur-sm top-0 left-1.5" />
                </div>
              </motion.div>
            )}
          </button>
        );
      })}
    </div>
  );
}
