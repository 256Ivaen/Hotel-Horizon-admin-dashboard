// Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";

import { CgWebsite } from "react-icons/cg";
import { FaProcedures, FaHotel } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { TbHotelService } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import React from "react";
import { assets } from "../../assets/assets";
import { getCurrentUser, logout } from "../../utils/service";

const Navbar = ({ isMobileOpen = false, onMobileClose, onMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const profileRef = useRef(null);
  const lastScrollY = useRef(0);

  const currentUser = getCurrentUser();
  const userType = currentUser?.role || "admin";
  const userName = currentUser?.name || "User";
  const userEmail = currentUser?.email || "user@example.com";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
        // Scrolling down
        setNavbarVisible(false);
      } else {
        // Scrolling up
        setNavbarVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getMenuItems = () => {
    return [
      { icon: FaHotel, label: "Dashboard", href: "/dashboard" },
      { icon: TbHotelService, label: "Reservations", href: "/reservations" },
      { icon: FaProcedures, label: "Room Analytics", href: "/room-analytics" },
      {
        icon: CgWebsite,
        label: "Website Analytics",
        href: "/website-analytics",
      },
      { icon: MdFamilyRestroom, label: "System Users", href: "/system-users" },
      { icon: IoSettingsOutline, label: "Settings", href: "/settings" },
    ];
  };

  const menuItems = getMenuItems();

  const isActive = (href) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/";
    }
    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    );
  };

  const handleLogout = () => {
    // Clear all localStorage items
    localStorage.clear();
    
    // Use window.location for a full page reload to clear all state
    window.location.href = '/login';
  };

  const handleHelpClick = () => {
    const message =
      "Hello Ivan%0A%0AI am facing an issue with the Hotel Horizon Admin Dashboard, Please help me fix this%0A%0Awhatsapp number +256709165008";
    window.open(`https://wa.me/256709165008?text=${message}`, "_blank");
  };

  if (!mounted) {
    return null;
  }

  // Desktop Navbar
  const DesktopNavbar = (
    <nav
      className={`hidden lg:flex h-[70px] bg-black fixed top-0 left-0 right-0 z-40 border-b border-white/10 transition-transform duration-300 ${
        navbarVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6">
        {/* Logo - Left */}
        <div className="flex items-center">
          <img src={assets.logo} alt="Logo" className="h-12 w-auto" />
        </div>

        {/* Navigation Items - Center */}
        <div className="flex items-center space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  active
                    ? "bg-white text-black"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-black" : "text-white"}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Profile - Right with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 p-1 pl-1 pr-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white">
              <span className="text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-white/60">{userEmail}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-white transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu - Black with white text */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-black rounded-lg shadow-lg py-2 z-50 border border-gray-800">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-400">{userEmail}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">Role: {userType}</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 rounded-full mx-2 my-2 transition-colors"
                style={{ width: "calc(100% - 16px)" }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  // Mobile Header
  const MobileHeader = (
    <div
      className={`lg:hidden fixed top-0 left-0 right-0 h-[70px] bg-black z-40 flex items-center justify-between px-4 transition-transform duration-300 ${
        navbarVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <button
        onClick={onMobileOpen}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-white" />
      </button>
      
      <img src={assets.logo} alt="Logo" className="h-10 w-auto" />
      
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <span className="text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </span>
        </button>

        {/* Mobile Dropdown Menu - Black with white text */}
        {profileOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-black rounded-lg shadow-lg py-2 z-50 border border-gray-800">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{userType}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 rounded-full mx-2 my-2 transition-colors"
              style={{ width: "calc(100% - 16px)" }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile Drawer
  const MobileDrawer = (
    <>
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`lg:hidden fixed top-0 left-0 w-80 h-full bg-black z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <img src={assets.logo} alt="Logo" className="h-12 w-auto" />
          <button
            onClick={onMobileClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <span className="text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400">{userEmail}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{userType}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 ${
                    active
                      ? "bg-white text-black"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-black" : "text-white"}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors justify-center"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );

  // Floating Help Button
  const FloatingHelpButton = (
    <button
      onClick={handleHelpClick}
      className="fixed bottom-6 right-6 z-50 w-8 h-8 bg-primary text-white rounded-full shadow-lg hover:bg-gray-900 transition-colors flex items-center justify-center border border-white/20"
      aria-label="Get help"
    >
      <HelpCircle className="w-5 h-5" />
    </button>
  );

  return (
    <>
      {DesktopNavbar}
      {MobileHeader}
      {MobileDrawer}
      {FloatingHelpButton}
    </>
  );
};

export default Navbar;