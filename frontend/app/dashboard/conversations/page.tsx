"use client";

import ConversationsPage from "@/components/ConversationsPage";
import { useI18n } from "@/lib/i18n";

export default function DashboardConversationsPage() {
  const { t } = useI18n();
  return (
    <ConversationsPage
      basePath="/dashboard"
      role="user"
      title={t("conversations.clientTitle")}
      description={t("conversations.clientCopy")}
      accent="frosted"
    />
  );
}
