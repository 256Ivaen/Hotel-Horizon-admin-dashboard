import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonColor = "blue",
  isDarkMode = false,
  loading = false,
}) => {
  const getConfirmButtonClasses = () => {
    const baseClasses = "px-4 py-2 text-xs rounded-md font-medium transition-colors disabled:opacity-50";
    
    switch (confirmButtonColor) {
      case "red":
      case "danger":
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
      case "orange":
        return `${baseClasses} bg-primary hover:bg-primary text-white`;
      case "green":
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
      default:
        return `${baseClasses} bg-primary hover:bg-primary text-white`;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } rounded-lg shadow-2xl border max-w-md w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    confirmButtonColor === "red" || confirmButtonColor === "danger"
                      ? isDarkMode ? "bg-red-900/30" : "bg-red-100"
                      : confirmButtonColor === "orange"
                      ? isDarkMode ? "bg-primary/30" : "bg-orange-100"
                      : confirmButtonColor === "green"
                      ? isDarkMode ? "bg-green-900/30" : "bg-green-100"
                      : isDarkMode ? "bg-primary/30" : "bg-primary/10"
                  }`}>
                    <svg
                      className={`w-6 h-6 ${
                        confirmButtonColor === "red" || confirmButtonColor === "danger"
                          ? isDarkMode ? "text-red-400" : "text-red-600"
                          : confirmButtonColor === "orange"
                          ? isDarkMode ? "text-orange-400" : "text-primary"
                          : confirmButtonColor === "green"
                          ? isDarkMode ? "text-green-400" : "text-green-600"
                          : isDarkMode ? "text-primary/40" : "text-primary"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {title}
                    </h3>
                    <p className={`text-xs mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className={`px-4 py-2 text-xs rounded-md font-medium transition-colors disabled:opacity-50 ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={getConfirmButtonClasses()}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;