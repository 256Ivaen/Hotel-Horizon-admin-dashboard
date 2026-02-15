import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { useScreenSize } from "@/hooks/use-screen-size";
import { cn } from "@/lib/utils";

export interface TabItem {
  title: string;
  content: React.ReactNode;
}

interface TabsSwitchProps {
  tabs: TabItem[];
  defaultTab?: number;
  className?: string;
  enableGooey?: boolean;
  tabClassName?: string;
  contentClassName?: string;
}

const TabsSwitch = ({
  tabs,
  defaultTab = 0,
  className,
  enableGooey = true,
  tabClassName,
  contentClassName,
}: TabsSwitchProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const screenSize = useScreenSize();

  return (
    <div className={cn("relative w-full", className)}>
      {enableGooey && (
        <GooeyFilter
          id="tabs-gooey-filter"
          strength={screenSize.lessThan("md") ? 8 : 15}
        />
      )}

      <div className="relative">
        {/* Background layer with gooey effect */}
        <div
          className="absolute inset-0"
          style={{ filter: enableGooey ? "url(#tabs-gooey-filter)" : "none" }}
        >
          <div className="flex w-full">
            {tabs.map((_, index) => (
              <div key={index} className="relative flex-1 h-10">
                {activeTab === index && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-gray-100 dark:bg-gray-800"
                    transition={{
                      type: "spring",
                      bounce: 0.0,
                      duration: 0.4,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content panel background */}
          <div
            className={cn(
              "w-full min-h-[200px] bg-gray-100 dark:bg-gray-800 overflow-hidden",
              contentClassName
            )}
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeTab}
                initial={{
                  opacity: 0,
                  y: 50,
                  filter: "blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: -50,
                  filter: "blur(10px)",
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
                className="p-6"
              >
                {tabs[activeTab]?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Interactive tab buttons overlay */}
        <div className="relative flex w-full">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "flex-1 h-10 flex items-center justify-center text-sm font-medium transition-colors",
                activeTab === index
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                tabClassName
              )}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export { TabsSwitch };
