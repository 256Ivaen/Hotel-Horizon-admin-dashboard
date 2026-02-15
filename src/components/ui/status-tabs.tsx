import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StatusTab {
  key: string;
  label: string;
  count?: number;
  icon?: React.ElementType;
  color?: "default" | "green" | "red" | "yellow" | "blue" | "purple" | "orange";
}

interface StatusTabsProps {
  tabs: StatusTab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

const colorStyles = {
  default: {
    active: "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
    inactive: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
    count: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    activeCount: "bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900"
  },
  green: {
    active: "bg-green-600 text-white dark:bg-green-500",
    inactive: "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300",
    count: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    activeCount: "bg-white/20 text-white"
  },
  red: {
    active: "bg-red-600 text-white dark:bg-red-500",
    inactive: "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300",
    count: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    activeCount: "bg-white/20 text-white"
  },
  yellow: {
    active: "bg-yellow-500 text-white dark:bg-yellow-400 dark:text-gray-900",
    inactive: "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300",
    count: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    activeCount: "bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900"
  },
  blue: {
    active: "bg-primary text-white dark:bg-primary",
    inactive: "text-primary dark:text-primary/40 hover:text-primary dark:hover:text-primary/30",
    count: "bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary/30",
    activeCount: "bg-white/20 text-white"
  },
  purple: {
    active: "bg-purple-600 text-white dark:bg-purple-500",
    inactive: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300",
    count: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    activeCount: "bg-white/20 text-white"
  },
  orange: {
    active: "bg-primary text-white dark:bg-orange-500",
    inactive: "text-primary dark:text-orange-400 hover:text-primary dark:hover:text-orange-300",
    count: "bg-orange-100 dark:bg-primary/30 text-primary dark:text-orange-300",
    activeCount: "bg-white/20 text-white"
  }
};

const StatusTabs: React.FC<StatusTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800/50",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = tab.color || "default";
        const styles = colorStyles[color];
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200",
              isActive ? styles.active : styles.inactive
            )}
          >
            {isActive && (
              <motion.div
                layoutId="status-tab-bg"
                className="absolute inset-0 rounded-md"
                style={{ backgroundColor: "currentColor", opacity: 0 }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full",
                    isActive ? styles.activeCount : styles.count
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export { StatusTabs };
