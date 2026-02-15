"use client";

import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { put, ApiErrorResponse } from "../../utils/service";
import { toast } from "sonner";

const LightThemeIcon = () => (
  <svg width="177" height="140" viewBox="0 0 177 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_77_15)">
      <rect width="177" height="162" rx="3" fill="white" />
      <rect x="-0.5" y="-0.5" width="178" height="163" rx="3.5" stroke="black" strokeOpacity="0.01" />
      <g filter="url(#filter0_d_77_15)">
        <path d="M44 0H174C175.657 0 177 1.34315 177 3V151H44V0Z" fill="#FAFAFA" />
      </g>
      <circle cx="35" cy="8" r="4" fill="#D4D4D4" />
      <circle cx="73" cy="40" r="4" fill="#D4D4D4" />
      <rect x="5" y="5" width="22" height="6" rx="1" fill="#E5E5E5" />
      <rect x="5" y="16" width="34" height="6" rx="1" fill="white" />
      <rect x="5.5" y="16.5" width="33" height="5" rx="0.5" stroke="black" strokeOpacity="0.08" />
      <rect x="5" y="26" width="34" height="6" rx="1" fill="#E5E5E5" />
      <rect x="81" y="37" width="13" height="2" rx="1" fill="#A3A3A3" />
      <rect x="96" y="37" width="19" height="2" rx="1" fill="#A3A3A3" />
      <rect x="81" y="42" width="8" height="2" rx="1" fill="#E5E5E5" />
      <rect x="91" y="42" width="15" height="2" rx="1" fill="#E5E5E5" />
      <rect x="108" y="42" width="6" height="2" rx="1" fill="#E5E5E5" />
      <rect x="116" y="42" width="12" height="2" rx="1" fill="#E5E5E5" />
      <rect x="130" y="42" width="9" height="2" rx="1" fill="#E5E5E5" />
      <rect x="69" y="47" width="8" height="2" rx="1" fill="#E5E5E5" />
      <rect x="79" y="47" width="2" height="2" rx="1" fill="#E5E5E5" />
      <rect x="83" y="47" width="9" height="2" rx="1" fill="#E5E5E5" />
      <rect x="94" y="47" width="16" height="2" rx="1" fill="#E5E5E5" />
      <rect x="112" y="47" width="7" height="2" rx="1" fill="#E5E5E5" />
      <rect x="121" y="47" width="3" height="2" rx="1" fill="#E5E5E5" />
      <rect x="126" y="47" width="9" height="2" rx="1" fill="#E5E5E5" />
      <rect x="137" y="47" width="4" height="2" rx="1" fill="#E5E5E5" />
      <rect x="143" y="47" width="6" height="2" rx="1" fill="#E5E5E5" />
      <rect x="5" y="36" width="34" height="6" rx="1" fill="#F5F5F5" />
      <rect x="5" y="46" width="34" height="6" rx="1" fill="#F5F5F5" />
      <rect x="5" y="56" width="34" height="6" rx="1" fill="#F5F5F5" />
      <rect x="69" y="53" width="84" height="47" rx="4" fill="#E5E5E5" />
      <rect width="177" height="140" fill="url(#paint0_linear_77_15)" fillOpacity="0.04" />
    </g>
    <defs>
      <filter id="filter0_d_77_15" x="43" y="0" width="134" height="151" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="-1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_77_15" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_77_15" result="shape" />
      </filter>
      <linearGradient id="paint0_linear_77_15" x1="88.5" y1="0" x2="88.5" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0.565789" stopOpacity="0" />
        <stop offset="1" />
      </linearGradient>
      <clipPath id="clip0_77_15">
        <rect width="177" height="140" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const DarkThemeIcon = () => (
  <svg width="177" height="140" viewBox="0 0 177 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_77_16)">
      <rect width="177" height="162" rx="3" fill="#171717" />
      <g filter="url(#filter0_d_77_16)">
        <path d="M44 0H174C175.657 0 177 1.34315 177 3V151H44V0Z" fill="#262626" />
      </g>
      <circle cx="35" cy="8" r="4" fill="#525252" />
      <circle cx="73" cy="40" r="4" fill="#525252" />
      <rect x="5" y="5" width="22" height="6" rx="1" fill="#404040" />
      <rect x="5" y="16" width="34" height="6" rx="1" fill="#171717" />
      <rect x="5.5" y="16.5" width="33" height="5" rx="0.5" stroke="white" strokeOpacity="0.12" />
      <rect x="5" y="26" width="34" height="6" rx="1" fill="#404040" />
      <rect x="81" y="37" width="13" height="2" rx="1" fill="#A3A3A3" />
      <rect x="96" y="37" width="19" height="2" rx="1" fill="#A3A3A3" />
      <rect x="81" y="42" width="8" height="2" rx="1" fill="#525252" />
      <rect x="91" y="42" width="15" height="2" rx="1" fill="#525252" />
      <rect x="108" y="42" width="6" height="2" rx="1" fill="#525252" />
      <rect x="116" y="42" width="12" height="2" rx="1" fill="#525252" />
      <rect x="130" y="42" width="9" height="2" rx="1" fill="#525252" />
      <rect x="69" y="47" width="8" height="2" rx="1" fill="#525252" />
      <rect x="79" y="47" width="2" height="2" rx="1" fill="#525252" />
      <rect x="83" y="47" width="9" height="2" rx="1" fill="#525252" />
      <rect x="94" y="47" width="16" height="2" rx="1" fill="#525252" />
      <rect x="112" y="47" width="7" height="2" rx="1" fill="#525252" />
      <rect x="121" y="47" width="3" height="2" rx="1" fill="#525252" />
      <rect x="126" y="47" width="9" height="2" rx="1" fill="#525252" />
      <rect x="137" y="47" width="4" height="2" rx="1" fill="#525252" />
      <rect x="143" y="47" width="6" height="2" rx="1" fill="#525252" />
      <rect x="5" y="36" width="34" height="6" rx="1" fill="#262626" />
      <rect x="5" y="46" width="34" height="6" rx="1" fill="#262626" />
      <rect x="5" y="56" width="34" height="6" rx="1" fill="#262626" />
      <rect x="69" y="53" width="84" height="47" rx="4" fill="#404040" />
      <rect width="177" height="140" fill="url(#paint0_linear_77_16)" fillOpacity="0.32" />
    </g>
    <defs>
      <filter id="filter0_d_77_16" x="43" y="0" width="134" height="151" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dx="-1" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_77_16" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_77_16" result="shape" />
      </filter>
      <linearGradient id="paint0_linear_77_16" x1="88.5" y1="0" x2="88.5" y2="140" gradientUnits="userSpaceOnUse">
        <stop offset="0.565789" stopOpacity="0" />
        <stop offset="1" />
      </linearGradient>
      <clipPath id="clip0_77_16">
        <rect width="177" height="140" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const OpenSidebarSkeleton = () => (
  <div className="w-full h-20 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-2 flex gap-2">
    <div className="w-12 bg-gray-200 dark:bg-gray-800 rounded flex flex-col gap-1 p-1">
      <div className="h-1.5 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-1.5 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-1.5 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="flex-1 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800 p-1.5">
      <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded mb-1"></div>
      <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
    </div>
  </div>
);

const ClosedSidebarSkeleton = () => (
  <div className="w-full h-20 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-2 flex gap-2">
    <div className="w-6 bg-gray-200 dark:bg-gray-800 rounded flex flex-col gap-1 p-1">
      <div className="h-1 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-1 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-1 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="flex-1 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800 p-1.5">
      <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded mb-1"></div>
      <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
    </div>
  </div>
);

const NavbarSkeleton = () => (
  <div className="w-full h-20 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-2">
    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded flex gap-1 px-1 items-center">
      <div className="h-2 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-2 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
      <div className="h-2 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="flex-1 bg-white dark:bg-gray-950 rounded border border-gray-200 dark:border-gray-800 p-1.5">
      <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded mb-1"></div>
      <div className="h-1 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
    </div>
  </div>
);

const SettingsDrawer = ({
  isOpen,
  onClose,
  theme,
  layout,
  textSize,
  onThemeChange,
  onLayoutChange,
  onTextSizeChange,
  isMobile,
}) => {
  // FORCE READ FROM LOCALSTORAGE
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("theme") || theme || "light";
  });
  
  const [currentLayout, setCurrentLayout] = useState(() => {
    return localStorage.getItem("layout") || layout || "navbar";
  });
  
  const [currentTextSize, setCurrentTextSize] = useState(() => {
    return localStorage.getItem("textSize") || textSize || "medium";
  });

  const [pendingTheme, setPendingTheme] = useState(null);
  const [pendingLayout, setPendingLayout] = useState(null);
  const [pendingTextSize, setPendingTextSize] = useState(null);
  const [saving, setSaving] = useState(false);

  // Sync with localStorage when drawer opens
  useEffect(() => {
    if (isOpen) {
      const savedTheme = localStorage.getItem("theme") || "light";
      const savedLayout = localStorage.getItem("layout") || "navbar";
      const savedTextSize = localStorage.getItem("textSize") || "medium";

      setCurrentTheme(savedTheme);
      setCurrentLayout(savedLayout);
      setCurrentTextSize(savedTextSize);
    }
  }, [isOpen]);

  const themes = [
    { value: "light", label: "Light", icon: LightThemeIcon },
    { value: "dark", label: "Dark", icon: DarkThemeIcon },
  ];

  const layouts = [
    { value: "open", label: "Open", component: OpenSidebarSkeleton },
    { value: "closed", label: "Closed", component: ClosedSidebarSkeleton },
    { value: "navbar", label: "Navbar", component: NavbarSkeleton },
  ];

  const saveSettings = async (key, value) => {
    setSaving(true);
    
    try {
      // Save to localStorage FIRST
      const storageKey = key === "text_size" ? "textSize" : key;
      localStorage.setItem(storageKey, value);

      // Update parent component IMMEDIATELY
      if (key === "theme") {
        setCurrentTheme(value);
        onThemeChange(value);
      } else if (key === "layout") {
        setCurrentLayout(value);
        onLayoutChange(value);
      } else if (key === "text_size") {
        setCurrentTextSize(value);
        onTextSizeChange(value);
      }

      // Then save to backend
      const response = await put<ApiErrorResponse>("/settings", {
        [key]: value,
      });

      if (response.success) {
        if (key === "theme") {
          toast.success("Theme updated successfully");
        } else if (key === "layout") {
          toast.success("Layout updated successfully");
        } else if (key === "text_size") {
          toast.success("Text size updated successfully");
        }

        setPendingTheme(null);
        setPendingLayout(null);
        setPendingTextSize(null);
      } else {
        throw new Error(response.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save to server. Changes saved locally.");

      // Don't revert - keep localStorage changes
      setPendingTheme(null);
      setPendingLayout(null);
      setPendingTextSize(null);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    if (saving || newTheme === currentTheme) return;
    setPendingTheme(newTheme);
    await saveSettings("theme", newTheme);
  };

  const handleLayoutChange = async (newLayout) => {
    if (saving || newLayout === currentLayout) return;
    setPendingLayout(newLayout);
    await saveSettings("layout", newLayout);
  };

  const handleTextSizeChange = async (size) => {
    if (saving || size === currentTextSize) return;
    setPendingTextSize(size);
    await saveSettings("text_size", size);
  };

  const drawerClasses = isMobile
    ? `fixed bottom-0 left-0 right-0 h-[80vh] bg-secondary z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out rounded-t-3xl ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`
    : `fixed top-0 right-0 h-full w-96 bg-secondary z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100 z-[60]" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <div className={drawerClasses}>
        <div className="h-full flex flex-col">
          {isMobile && (
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
            </div>
          )}

          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <FiX className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-xs font-medium text-white/70 mb-3">Text Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "small", label: "Small" },
                  { value: "medium", label: "Medium" },
                  { value: "large", label: "Large" },
                ].map((size) => (
                  <button
                    key={size.value}
                    onClick={() => handleTextSizeChange(size.value)}
                    disabled={saving}
                    className={`px-4 py-3 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                      (pendingTextSize || currentTextSize) === size.value
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {saving && pendingTextSize === size.value ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      size.label
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-white/70 mb-3">Theme</h3>
              <div className="grid gap-3 grid-cols-2">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isSelected = (pendingTheme || currentTheme) === themeOption.value;

                  return (
                    <div
                      key={themeOption.value}
                      className={`flex items-end justify-center rounded-md border px-1.5 pt-3 transition cursor-pointer bg-white ${
                        themeOption.value === "dark" ? "dark" : ""
                      } ${
                        isSelected ? "border-primary ring-2 ring-primary/60" : "border-gray-200"
                      } ${saving ? "opacity-50 pointer-events-none" : ""}`}
                      onClick={() => !saving && handleThemeChange(themeOption.value)}
                    >
                      <label className="relative cursor-pointer w-full">
                        <span className="block h-full w-full overflow-hidden">
                          <span className="block rounded-t-sm border border-b-0 shadow-xl shadow-black/20 h-20">
                            <Icon />
                          </span>
                        </span>
                        <span className="absolute inset-x-0 bottom-2 flex justify-center">
                          <span className="relative">
                            <span className="relative inline-flex h-[30px] transform-gpu touch-none select-none items-center justify-center gap-2 rounded-md border-none border-transparent bg-white dark:bg-gray-800 px-3 text-[13px] font-semibold leading-none text-gray-900 dark:text-white shadow-sm after:absolute after:-inset-[1px] after:block after:rounded-md after:bg-gradient-to-t after:from-black/5 after:opacity-50 after:transition-opacity hover:after:opacity-100 dark:after:from-black/[0.15]">
                              {saving && pendingTheme === themeOption.value ? (
                                <div className="w-3 h-3 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                themeOption.label
                              )}
                            </span>
                            {isSelected && (
                              <span className="absolute inset-x-1.5 -bottom-3 h-0.5 rounded-full bg-primary" />
                            )}
                          </span>
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-white/70 mb-3">Layout Preferences</h3>
              <div className="grid grid-cols-3 gap-2">
                {layouts.map((layoutOption) => {
                  const SkeletonComponent = layoutOption.component;
                  const isSelected = (pendingLayout || currentLayout) === layoutOption.value;

                  return (
                    <div
                      key={layoutOption.value}
                      className={`relative rounded-lg border transition-all cursor-pointer bg-gray-50 dark:bg-gray-900 overflow-hidden ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/50"
                          : "border-white/20 hover:border-white/40"
                      } ${saving ? "opacity-50 pointer-events-none" : ""}`}
                      onClick={() => !saving && handleLayoutChange(layoutOption.value)}
                    >
                      <div className="p-2">
                        <SkeletonComponent />
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 text-center mt-2 flex items-center justify-center gap-1">
                          {saving && pendingLayout === layoutOption.value ? (
                            <div className="w-3 h-3 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            layoutOption.label
                          )}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary rounded-full mx-auto w-3/4"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="w-full bg-white/20 border border-white/30 text-white py-3 rounded-xl text-xs font-medium hover:bg-white/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;