import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiSettings,
  FiUsers,
  FiLogOut,
  FiDollarSign,
  FiUser,
  FiBook,
  FiCreditCard,
  FiFileText,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiList,
  FiPenTool,
} from "react-icons/fi";
import { getCurrentUser, logout } from "../../utils/service";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userType = currentUser?.role || "admin";

  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (userType === "admin") return true;
    if (userType === "systemadmin") return true;
    return requiredPermissions.includes(userType);
  };

  const getMenuItems = () => {
    const allMenuItems = [
      { 
        icon: FiHome, 
        label: "Dashboard", 
        href: "/dashboard", 
        permissions: [] 
      },
      { 
        icon: FiUsers, 
        label: "Users", 
        href: "/users", 
        permissions: ["admin", "systemadmin"] 
      },
      { 
        icon: FiPenTool, 
        label: "Instructors", 
        href: "/instructors", 
        permissions: ["admin", "systemadmin"] 
      },
      { 
        icon: FiUser, 
        label: "Students", 
        href: "/students", 
        permissions: ["admin", "management", "systemadmin", "instructor"] 
      },
      { 
        icon: FiList, 
        label: "Intakes", 
        href: "/intakes", 
        permissions: ["admin", "management", "systemadmin"] 
      },
      { 
        icon: FiBook, 
        label: "Courses", 
        href: "/courses", 
        permissions: ["admin", "systemadmin", "instructor"] 
      },
      { 
        icon: FiClock, 
        label: "Timetables", 
        href: "/timetables", 
        permissions: ["admin", "systemadmin", "instructor", "student"] 
      },
      {
        icon: FiCheckCircle,
        label: "Grades",
        href: "/grades",
        permissions: ["admin", "systemadmin", "instructor"]
      },
      {
        icon: FiSettings,
        label: "Settings",
        href: "/settings",
        permissions: ["admin", "systemadmin"]
      },
    ];

    const studentMenuItems = [
      { icon: FiHome, label: "Dashboard", href: "/dashboard", permissions: [] },
      { icon: FiUser, label: "Profile", href: "/profile", permissions: [] },
      { icon: FiFileText, label: "Invoices", href: "/invoices", permissions: [] },
      { icon: FiCreditCard, label: "Payments", href: "/payments", permissions: [] },
      { icon: FiCheckCircle, label: "Grades", href: "/grades", permissions: [] },
      { icon: FiClock, label: "Timetables", href: "/timetables", permissions: [] },
    ];

    if (userType === "student") {
      return studentMenuItems;
    }

    return allMenuItems.filter(item => hasPermission(item.permissions));
  };

  const filteredMenuItems = getMenuItems();

  const handleLogout = () => {
    logout();
  };

  const handleItemClick = (href) => {
    navigate(href);
  };

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed top-16 left-0 right-0 z-50 bg-black text-white border-b border-white/10 shadow-lg">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => handleItemClick(item.href)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all rounded-lg ml-4 flex-shrink-0"
          >
            <FiLogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;