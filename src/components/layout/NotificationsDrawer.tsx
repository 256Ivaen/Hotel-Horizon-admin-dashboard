"use client";

import React, { useState, useEffect } from "react";
import { FiX, FiBell } from "react-icons/fi";
import { get, post, del } from "../../utils/service";
import { toast } from "sonner";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  onUpdate?: () => void;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: Notification[];
    meta: PaginationMeta;
  };
  message?: string;
}

interface ActionResponse {
  success: boolean;
  message?: string;
}

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ 
  isOpen, 
  onClose, 
  isMobile, 
  onUpdate 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await get<ApiResponse>("/notifications?per_page=15");
      if (response.success && response.data?.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await post<ActionResponse>("/notifications/mark-all-read");
      if (response.success) {
        toast.success("All notifications marked as read");
        fetchNotifications();
        onUpdate?.();
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await post<ActionResponse>(`/notifications/${id}/read`);
      if (response.success) {
        fetchNotifications();
        onUpdate?.();
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await del<ActionResponse>(`/notifications/${id}`);
      if (response.success) {
        toast.success("Notification deleted");
        fetchNotifications();
        onUpdate?.();
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const drawerClasses = isMobile
    ? `fixed bottom-0 left-0 right-0 h-[80vh] bg-white dark:bg-gray-800 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out rounded-t-3xl ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`
    : `fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out ${
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
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          )}

          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Notifications</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 transition-colors ${
                      notif.read_at
                        ? "bg-white dark:bg-gray-800"
                        : "bg-primary/5 dark:bg-primary/10"
                    } hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer`}
                    onClick={() => !notif.read_at && markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      {!notif.read_at && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        {notif.title && (
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            {notif.title}
                          </p>
                        )}
                        <p className="text-xs text-gray-800 dark:text-gray-200">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(notif.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      >
                        <FiX className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FiBell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">No notifications</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
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

export default NotificationsDrawer;