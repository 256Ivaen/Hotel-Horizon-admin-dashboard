import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Globe,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
} from "lucide-react";

import { CgWebsite } from "react-icons/cg";
import { FaProcedures, FaHotel } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { TbHotelService } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import React from "react";
import { assets } from "../../assets/assets";
import { getCurrentUser, logout } from "../../utils/service";

const Sidebar = ({
  isCollapsed,
  isMobileOpen = false,
  onMobileClose,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  const currentUser = getCurrentUser();
  const userType = currentUser?.role || "admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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

  const getMenuItems = () => {
    const menuItems = [
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

    return menuItems;
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

  const handleNavClick = () => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleHelpClick = () => {
    const message =
      "Hello Ivan%0A%0AI am facing an issue with the Hotel Horizon Admin Dashboard, Please help me fix this%0A%0Awhatsapp number +256709165008";
    window.open(`https://wa.me/256709165008?text=${message}`, "_blank");
  };

  if (!mounted) {
    return null;
  }

  const renderMenuItem = (item, isInMobile = false) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <div key={item.href} className="mb-0.5">
        <Link
          to={item.href}
          onClick={handleNavClick}
          className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 rounded-lg ${
            isCollapsed && !isInMobile ? "justify-center" : ""
          } ${active ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
          title={isCollapsed && !isInMobile ? item.label : undefined}
        >
          <Icon
            className={`w-4 h-4 shrink-0 ${
              active ? "text-black" : "text-white"
            }`}
          />
          {(!isCollapsed || isInMobile) && (
            <span className="text-xs font-medium truncate">{item.label}</span>
          )}
        </Link>
      </div>
    );
  };

  const DesktopSidebar = (
    <aside
      className="hidden lg:flex flex-col transition-all duration-300 h-screen fixed left-0 top-0 z-40 bg-primary border-r border-white/10"
      style={{
        width: isCollapsed ? "80px" : "260px",
      }}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center h-[70px] shrink-0 relative border-b border-white/10">
        {!isCollapsed ? (
          <div className="flex items-start gap-3">
            <div className="flex items-start">
              <img
                src={assets.logo}
                alt="Logo"
                className="object-cover h-16 w-auto"
              />
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img
              src={assets.logo}
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        )}

        {/* Collapse Toggle Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-primary rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-primary" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-primary" />
            )}
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="space-y-0.5">
          {menuItems.map((item) => renderMenuItem(item, false))}
        </div>
      </nav>

      {/* Help Card */}
      {!isCollapsed && (
        <div className="px-3 pb-4 pt-6">
          <div className="relative">
            <div className="absolute -left-2 -bottom-3 -top-20 z-10">
              <img
                src={assets.HelpMale}
                alt="Need help?"
                width={110}
                height={140}
                className="object-contain"
              />
            </div>
            {/* Card Content */}
            <div className="bg-white/10 border border-white/20 rounded-xl shadow-lg p-3 pl-24 min-h-[80px] flex flex-col justify-center items-end text-right">
              <p className="text-xs text-white/80">
                <span className="font-semibold text-white">Need help ?</span>
                <br />
                feel free to contact
              </p>
              <button
                onClick={handleHelpClick}
                className="mt-2 px-4 py-1.5 bg-white text-black text-xs font-medium rounded-full hover:bg-white/90 transition-colors"
              >
                Get Help
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  const MobileSidebar = (
    <>
      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Bottom Drawer Panel */}
      <aside
        className={`lg:hidden fixed inset-x-0 bottom-0 w-full max-h-[90vh] bg-primary z-50 flex flex-col transform transition-transform duration-300 ease-out shadow-[0_-4px_25px_rgba(0,0,0,0.12)] rounded-t-[28px] overflow-hidden overflow-x-hidden ${
          isMobileOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Drawer Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className=" rounded-lg flex items-center justify-center">
              <img
                src={assets.logo}
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Menu Items */}
        <nav
          className="flex-1 px-5 py-4 overflow-y-auto overflow-x-hidden"
          style={{
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="space-y-0.5">
            {menuItems.map((item) => renderMenuItem(item, true))}
          </div>

          {/* Mobile Help Card */}
          <div className="px-0 py-4">
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center justify-between">
              <p className="text-xs text-white/80">
                <span className="font-semibold text-white">Need help ?</span>
                <br />
                feel free to contact
              </p>
              <button
                onClick={handleHelpClick}
                className="px-5 py-2 bg-white text-black text-xs font-medium rounded-full hover:bg-white/90 transition-colors"
              >
                Get Help
              </button>
            </div>
          </div>

          {/* Mobile Logout */}
          <div className="mt-2 pt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );

  return (
    <>
      {DesktopSidebar}
      {MobileSidebar}
    </>
  );
};

export default Sidebar;
