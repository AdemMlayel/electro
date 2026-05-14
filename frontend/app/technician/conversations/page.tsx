"use client";

import ConversationsPage from "@/components/ConversationsPage";
import { useI18n } from "@/lib/i18n";

export default function TechnicianConversationsPage() {
  const { t } = useI18n();
  return (
    <ConversationsPage
      basePath="/technician"
      role="technician"
      title={t("conversations.technicianTitle")}
      description={t("conversations.technicianCopy")}
      accent="indigo"
    />
  );
}
