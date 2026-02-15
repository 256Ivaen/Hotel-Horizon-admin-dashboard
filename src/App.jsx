import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFound";
import DashboardPage from "./pages/Dashboard";
import ReservationsPage from "./pages/Reservations/Reservations";
import { isLoggedIn, logout } from "./utils/service";
import RoomAnalytics from "./pages/Room Stats/RoomStats";
import WebsiteAnalytics from "./pages/WebsiteAnalytics/WebsiteAnalytics";

const isAuthenticated = () => {
  return isLoggedIn();
};

const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentDarkMode = localStorage.getItem("darkMode");
      if (currentDarkMode) {
        setDarkMode(JSON.parse(currentDarkMode));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
      <Toaster position="top-right" expand={false} richColors closeButton theme={darkMode ? "dark" : "light"} toastOptions={{ style: { background: darkMode ? "#1f2937" : "#ffffff", color: darkMode ? "#f9fafb" : "#111827", border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb" } }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="room-analytics" element={<RoomAnalytics />} />
            <Route path="website-analytics" element={<WebsiteAnalytics />} />
          </Route>
          <Route path="*" element={<NotFoundPage darkMode={darkMode} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;