"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedSidebarState = localStorage.getItem("sidebarCollapsed");
    if (savedSidebarState) setSidebarCollapsed(savedSidebarState === "true");
  }, []);

  const handleToggleDesktopSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [headerFloating, setHeaderFloating] = useState(false);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const currentY = el.scrollTop;
    const isScrollingUp = currentY < lastScrollY.current;
    const isPastThreshold = currentY > 70;

    setHeaderFloating(isPastThreshold);

    if (isScrollingUp || currentY < 20) {
      setHeaderVisible(true);
    } else if (currentY > lastScrollY.current + 5) {
      setHeaderVisible(false);
    }

    lastScrollY.current = currentY;
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onToggleCollapse={handleToggleDesktopSidebar}
      />

      {/* Main Content Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`h-screen overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
        }`}
      >
        {/* Header - sticky with auto-hide on scroll */}
        {/* <div
          className={`sticky top-0 z-30 transition-all duration-300 ${
            headerVisible ? "translate-y-0" : "-translate-y-full"
          } ${headerFloating ? "bg-white/60 backdrop-blur-2xl shadow-sm" : ""}`}
        >
          <Header
            isMobile={false}
            onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          />
        </div> */}

        {/* Page Content */}
        <main className="p-6 bg-white text-gray-500">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
