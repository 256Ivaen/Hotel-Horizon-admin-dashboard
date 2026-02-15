import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const Drawer = ({ isOpen, onClose, children, position = "right", heightPercentage = 80, showCloseButton = true, title, className = "", size = "md" }) => {
  const drawerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
    checkDarkMode();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") checkDarkMode();
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentPosition = isMobile ? "bottom" : position;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDragEnd = (event, info) => {
    if (currentPosition === "bottom") {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      }
    } else if (currentPosition === "right") {
      if (info.offset.x > 100 || info.velocity.x > 500) {
        onClose();
      }
    }
  };

  const getDrawerStyles = () => {
    const baseStyles = {};
    if (currentPosition === "bottom") {
      return { ...baseStyles, bottom: 0, left: 0, right: 0, height: `${heightPercentage}vh`, borderTopLeftRadius: "0.75rem", borderTopRightRadius: "0.75rem" };
    } else {
      const width = size === "lg" ? "440px" : size === "xl" ? "540px" : "380px";
      return { ...baseStyles, top: "0.5rem", right: "0.5rem", bottom: "0.5rem", width: width, borderRadius: "0.75rem" };
    }
  };

  const getAnimationVariants = () => {
    if (currentPosition === "bottom") {
      return { initial: { y: "100%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "100%", opacity: 0 } };
    } else {
      return { initial: { x: "100%", opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: "100%", opacity: 0 } };
    }
  };

  const getDragConstraints = () => {
    if (currentPosition === "bottom") {
      return { top: 0, bottom: 0 };
    } else {
      return { left: 0, right: 0 };
    }
  };

  const getDragDirection = () => {
    return currentPosition === "bottom" ? "y" : "x";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            ref={drawerRef}
            variants={getAnimationVariants()}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag={getDragDirection()}
            dragConstraints={getDragConstraints()}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={`fixed z-[60] overflow-hidden shadow-2xl ${isDarkMode ? "bg-gray-800" : "bg-white"} ${className}`}
            style={{ ...getDrawerStyles() }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full flex flex-col">
              {currentPosition === "bottom" && (
                <div className="flex items-center justify-center py-3 shrink-0">
                  <div className={`w-10 h-1 rounded-sm ${isDarkMode ? "bg-gray-600" : "bg-gray-300"}`} />
                </div>
              )}

              {(title || showCloseButton) && (
                <div className={`flex items-center justify-between px-5 py-3 shrink-0 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                  {title && <h2 className={`text-xs font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{title}</h2>}
                  {showCloseButton && (
                    <button onClick={onClose} className="inline-flex items-center gap-1.5 px-1 pl-3 py-1 rounded-full text-xs font-medium transition-all ml-auto bg-gray-900 text-white hover:bg-black">
                      Close
                      <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <FiX size={11} className="text-white" />
                      </span>
                    </button>
                  )}
                </div>
              )}

              <div className={`flex-1 overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;