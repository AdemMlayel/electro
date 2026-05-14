"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Conversation, ConversationListResponse, Ticket } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { translateApplianceName } from "@/lib/display";

interface ConversationsPageProps {
  basePath: "/dashboard" | "/technician";
  role: "user" | "technician";
  title: string;
  description: string;
  accent: "frosted" | "indigo";
}

export default function ConversationsPage({
  basePath,
  role,
  title,
  description,
  accent,
}: ConversationsPageProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [eligibleTickets, setEligibleTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingTicketId, setOpeningTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    const interval = window.setInterval(fetchConversations, 20000);
    return () => window.clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await apiFetch<ConversationListResponse>("/conversations");
      setConversations(data.items);
      setEligibleTickets(data.eligible_tickets);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      setError(error instanceof Error ? error.message : t("conversations.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  const ticketsWithoutConversation = useMemo(() => {
    const covered = new Set(conversations.map((conversation) => conversation.ticket_id));
    return eligibleTickets.filter((ticket) => !covered.has(ticket.id));
  }, [conversations, eligibleTickets]);

  const openConversationForTicket = async (ticketId: string) => {
    setOpeningTicketId(ticketId);
    try {
      const conversation = await apiFetch<Conversation>("/conversations", {
        method: "POST",
        body: JSON.stringify({ ticket_id: ticketId }),
      });
      router.push(`${basePath}/conversations/${conversation.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : t("conversations.failedOpen"));
    } finally {
      setOpeningTicketId(null);
    }
  };

  const accentClasses =
    accent === "indigo"
      ? {
          badge: "bg-indigo-100 text-indigo-700",
          button: "bg-indigo-600 hover:bg-indigo-700",
        }
      : {
          badge: "bg-frosted-100 text-frosted-700",
          button: "bg-frosted-600 hover:bg-frosted-700",
        };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prussian-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ink-900">{title}</h1>
        <p className="text-ink-500 mt-2">{description}</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink-900">{t("conversations.active")}</h2>
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${accentClasses.badge}`}>
            {conversations.length} {t("conversations.threads")}
          </span>
        </div>

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            {t("conversations.empty")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {conversations.map((conversation) => {
              const otherPartyName =
                role === "technician"
                  ? conversation.client_name || "Client"
                  : conversation.technician_name || t("conversations.pendingTech");

              return (
                <button
                  key={conversation.id}
                  onClick={() => router.push(`${basePath}/conversations/${conversation.id}`)}
                  className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-ink-400">{translateApplianceName(conversation.appliance_name, conversation.appliance_icon, t)}</p>
                      <h3 className="text-lg font-semibold text-ink-900 mt-1">{otherPartyName}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-ink-600">
                        {conversation.last_message_body || conversation.ticket_description || t("conversations.startTalking")}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accentClasses.badge}`}>
                        {conversation.unread_count} {t("notifications.unread")}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-500">
                    <span>{t("conversations.ticket")} #{conversation.ticket_id.slice(0, 8)}</span>
                    {conversation.ticket_status && <span>{t(`ticket.status.${conversation.ticket_status}`)}</span>}
                    {conversation.last_message_created_at && (
                      <span>{new Date(conversation.last_message_created_at).toLocaleString()}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-ink-900 mb-4">{t("conversations.ready")}</h2>
        {ticketsWithoutConversation.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            {role === "technician"
              ? t("conversations.technicianEmptyReady")
              : t("conversations.clientEmptyReady")}
          </div>
        ) : (
          <div className="space-y-4">
            {ticketsWithoutConversation.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm text-ink-400">{t("conversations.ticket")} #{ticket.id.slice(0, 8)}</p>
                  <h3 className="text-lg font-semibold text-ink-900 mt-1">{translateApplianceName(ticket.appliance_name, ticket.appliance_icon, t)}</h3>
                  <p className="mt-2 text-sm text-ink-600 line-clamp-2">{ticket.description}</p>
                  <p className="mt-2 text-sm text-ink-500">
                    {role === "technician"
                      ? `${t("conversations.client")}: ${ticket.user_name || t("conversations.unknown")}`
                      : `${t("common.technician")}: ${ticket.technician_name || t("conversations.assignedTech")}`}
                  </p>
                </div>
                <button
                  onClick={() => openConversationForTicket(ticket.id)}
                  disabled={openingTicketId === ticket.id}
                  className={`rounded-xl px-5 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 ${accentClasses.button}`}
                >
                  {openingTicketId === ticket.id ? t("conversations.opening") : t("conversations.openChat")}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
