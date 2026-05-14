"use client";

import NotificationsPage from "@/components/NotificationsPage";
import { useI18n } from "@/lib/i18n";

export default function DashboardNotificationsPage() {
  const { t } = useI18n();
  return (
    <NotificationsPage
      title={t("notifications.mine")}
      description={t("notifications.mineCopy")}
      accent="frosted"
    />
  );
}
