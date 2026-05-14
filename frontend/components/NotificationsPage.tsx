"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { NotificationItem, NotificationsResponse } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface NotificationsPageProps {
  title: string;
  description: string;
  accent: "frosted" | "indigo";
}

export default function NotificationsPage({
  title,
  description,
  accent,
}: NotificationsPageProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 20000);
    return () => window.clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch<NotificationsResponse>("/notifications?limit=50");
      setNotifications(data.items);
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" });
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const accentClasses =
    accent === "indigo"
      ? {
          pill: "bg-indigo-100 text-indigo-700",
          button: "bg-indigo-600 hover:bg-indigo-700",
          border: "border-indigo-200",
        }
      : {
          pill: "bg-frosted-100 text-frosted-700",
          button: "bg-frosted-600 hover:bg-frosted-700",
          border: "border-frosted-200",
        };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prussian-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink-900">{title}</h1>
          <p className="text-ink-500 mt-2">{description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${accentClasses.pill}`}>
            {unreadCount} {t("notifications.unread")}
          </span>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 ${accentClasses.button}`}
          >
            {t("notifications.markAll")}
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          {t("notifications.empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            return (
              <div
                key={notification.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  notification.is_read ? "border-gray-100" : `${accentClasses.border} border-2`
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`${notification.link ? "cursor-pointer" : ""} flex-1 space-y-2`}
                    onClick={() => {
                      if (!notification.link) return;
                      if (!notification.is_read) {
                        void markAsRead(notification.id);
                      }
                      router.push(notification.link);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-ink-900">{notification.title}</h2>
                      {!notification.is_read && (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${accentClasses.pill}`}>
                          {t("notifications.new")}
                        </span>
                      )}
                    </div>
                    <p className="text-ink-600">{notification.body}</p>
                    <p className="text-sm text-ink-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {notification.link && (
                      <p className="text-sm font-medium text-prussian-600">{t("notifications.openRelated")}</p>
                    )}
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                    >
                      {t("notifications.read")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
