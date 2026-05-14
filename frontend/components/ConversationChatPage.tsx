"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  Conversation,
  ConversationDetailResponse,
  ConversationMessage,
  User,
} from "@/lib/types";
import { translateApplianceName } from "@/lib/display";
import { useI18n } from "@/lib/i18n";

interface ConversationChatPageProps {
  basePath: "/dashboard" | "/technician";
  conversationId: string;
  accent: "frosted" | "indigo";
}

export default function ConversationChatPage({
  basePath,
  conversationId,
  accent,
}: ConversationChatPageProps) {
  const { t } = useI18n();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchData();
    const interval = window.setInterval(fetchConversation, 5000);
    return () => window.clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const fetchData = async () => {
    try {
      const [userData] = await Promise.all([apiFetch<User>("/auth/me"), fetchConversation()]);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Failed to fetch chat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async () => {
    const data = await apiFetch<ConversationDetailResponse>(`/conversations/${conversationId}`);
    setConversation(data.conversation);
    setMessages(data.messages);
    return data;
  };

  const otherParticipant = useMemo(() => {
    if (!conversation || !currentUser) return null;
    return currentUser.role === "technician"
      ? {
          name: conversation.client_name,
          email: conversation.client_email,
          phone: conversation.client_phone,
        }
      : {
          name: conversation.technician_name,
          email: conversation.technician_email,
          phone: conversation.technician_phone,
        };
  }, [conversation, currentUser]);

  const accentClasses =
    accent === "indigo"
      ? {
          bubble: "bg-indigo-600 text-white",
          button: "bg-indigo-600 hover:bg-indigo-700",
          subtle: "bg-indigo-50 text-indigo-700",
        }
      : {
          bubble: "bg-frosted-600 text-white",
          button: "bg-frosted-600 hover:bg-frosted-700",
          subtle: "bg-frosted-50 text-frosted-700",
        };

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;

    setSending(true);
    try {
      await apiFetch(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: draft.trim() }),
      });
      setDraft("");
      await fetchConversation();
    } catch (error) {
      alert(error instanceof Error ? error.message : t("chat.failedSend"));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-prussian-600"></div>
      </div>
    );
  }

  if (!conversation || !currentUser) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          {t("chat.notFound")}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link href={`${basePath}/conversations`} className="text-sm font-medium text-ink-500 hover:text-ink-700">
            ← {t("chat.back")}
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-ink-900">
            {otherParticipant?.name || t("chat.conversation")}
          </h1>
          <p className="mt-2 text-ink-500">
            {translateApplianceName(conversation.appliance_name, conversation.appliance_icon, t)} · {t("conversations.ticket")} #{conversation.ticket_id.slice(0, 8)} ·{" "}
            {conversation.ticket_status ? t(`ticket.status.${conversation.ticket_status}`) : ""}
          </p>
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm ${accentClasses.subtle}`}>
          {otherParticipant?.email && <div>{otherParticipant.email}</div>}
          {otherParticipant?.phone && <div>{otherParticipant.phone}</div>}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
              {t("chat.empty")}
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.sender_id === currentUser.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      mine ? accentClasses.bubble : "bg-gray-100 text-ink-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                    <p className={`mt-2 text-xs ${mine ? "text-white/80" : "text-ink-400"}`}>
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-gray-100 p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              placeholder={t("chat.placeholder")}
              className="min-h-[100px] flex-1 rounded-2xl border border-gray-200 px-4 py-3 text-ink-900 focus:outline-none focus:ring-2 focus:ring-prussian-500"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className={`rounded-2xl px-6 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-gray-300 ${accentClasses.button}`}
            >
              {sending ? t("chat.sending") : t("chat.send")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
