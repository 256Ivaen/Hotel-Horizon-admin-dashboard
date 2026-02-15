"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiCalendar, FiBriefcase } from "react-icons/fi";
import { get } from "../../utils/service";
import { toast } from "sonner";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  isMobile: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

const ProfileDrawer: React.FC<ProfileDrawerProps> = ({ isOpen, onClose, onEditProfile, isMobile }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await get<ApiResponse>("/profile");
      if (response.success) {
        setUser(response.data);
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (): string => {
    switch (user?.role) {
      case "admin":
        return "Administrator";
      case "accounts":
        return "Accounts";
      case "management":
        return "Management";
      case "instructor":
        return "Instructor";
      case "student":
        return "Student";
      default:
        return "User";
    }
  };

  const getInitials = (): string => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const drawerClasses = isMobile
    ? `fixed bottom-0 left-0 right-0 h-[80vh] bg-white dark:bg-gray-800 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out rounded-t-3xl ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`
    : `fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`;

  const renderSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
        <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded mt-0.5"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          )}

          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              renderSkeleton()
            ) : user ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">{getInitials()}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{getRoleDisplayName()}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <FiUser className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="text-xs text-gray-800 dark:text-white mt-1">{user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiMail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="text-xs text-gray-800 dark:text-white mt-1">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiBriefcase className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                      <p className="text-xs text-gray-800 dark:text-white mt-1">{getRoleDisplayName()}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiCalendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                      <p className="text-xs text-gray-800 dark:text-white mt-1">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <button
              onClick={onEditProfile}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Edit Profile
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white py-3 rounded-xl text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileDrawer;