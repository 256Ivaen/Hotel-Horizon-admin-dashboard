"use client";

import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";
import { FiUser, FiMenu } from "react-icons/fi";
import { getCurrentUser } from "../../utils/service";

const Header = ({ isMobile, onToggleMobileSidebar }) => {
  const [mounted, setMounted] = useState(false);

  const currentUser = getCurrentUser();
  const userName = currentUser?.name || "User";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="h-[70px] shrink-0 flex items-center justify-between px-4 sm:px-6 bg-transparent transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="h-[70px] shrink-0 flex items-center justify-between px-4 sm:px-6 bg-transparent transition-all duration-300">
        <div className="flex items-center gap-3">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Open menu"
            >
              <FiMenu className="w-5 h-5 text-gray-800" />
            </button>
          )}

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <img src={assets.logo} alt="Logo" className="h-8 w-auto" />
            <span className="text-lg font-bold text-black hidden sm:block">
              Hotel Horizon
            </span>
          </div>

          {/* Greeting Text */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-800">
              {getGreeting()}, {userName}
            </p>
            <p className="text-xs text-gray-500">Welcome to Horizon.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 p-1 pr-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <FiUser size={16} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                {userName}
              </p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;