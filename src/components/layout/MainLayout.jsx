// MainLayout.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navbar - handles both desktop and mobile navigation */}
      <Navbar
        isMobileOpen={mobileDrawerOpen}
        onMobileClose={() => setMobileDrawerOpen(false)}
        onMobileOpen={() => setMobileDrawerOpen(true)}
      />

      {/* Main Content Area with padding-top for fixed navbar */}
      <div className="pt-[70px] min-h-screen">
        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;