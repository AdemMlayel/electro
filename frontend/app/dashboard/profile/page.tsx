"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import { Conversation, User, Ticket, PaginatedResponse, Appliance, ProblemType } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { translateApplianceName, translateProblemLabel } from "@/lib/display";
import {
  Refrigerator,
  WashingMachine,
  Microwave,
  CookingPot,
  Wind,
  Tv,
  Flame,
  Trash2,
  Coffee,
  Fan,
  Utensils,
  AirVent,
  Plug,
  Snowflake,
  Shirt,
  Zap,
  Thermometer,
  Speaker,
  Laptop,
  Printer,
  MapPin,
  Phone,
  Calendar,
  Clock,
  Mail,
  User as UserIcon,
  Wrench,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash,
  Eye,
  X,
  LucideIcon,
  Lock,
  Key,
} from "lucide-react";

// Dynamic import for LocationPicker to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-frosted-600"></div>
    </div>
  ),
});

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  refrigerator: Refrigerator,
  washing_machine: WashingMachine,
  microwave: Microwave,
  oven: CookingPot,
  dishwasher: Utensils,
  ac: AirVent,
  tv: Tv,
  vacuum: Wind,
  water_heater: Flame,
  disposal: Trash2,
  coffee: Coffee,
  fan: Fan,
  freezer: Snowflake,
  dryer: Shirt,
  electrical: Zap,
  heater: Thermometer,
  speaker: Speaker,
  computer: Laptop,
  printer: Printer,
  default: Plug,
};

const getApplianceIcon = (iconKey?: string): LucideIcon => {
  if (iconKey && iconMap[iconKey]) {
    return iconMap[iconKey];
  }
  return Plug;
};

export default function UserProfile() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", email: "", current_password: "", new_password: "" });
  const [cancelTicketId, setCancelTicketId] = useState<string | null>(null);
  const [editLocation, setEditLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [profileEditMode, setProfileEditMode] = useState<"info" | "email" | "password">("info");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, ticketsData] = await Promise.all([
        apiFetch<User>("/auth/me"),
        apiFetch<PaginatedResponse<Ticket>>("/tickets?limit=100"),
      ]);
      setUser(userData);
      setTickets(ticketsData.items);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTicket = async (ticket: Ticket) => {
    setEditingTicket(ticket);
    setEditLocation({
      lat: ticket.latitude || 36.8065,
      lng: ticket.longitude || 10.1815,
      address: ticket.address || "",
    });
    try {
      const [appliancesData, problemTypesData] = await Promise.all([
        apiFetch<Appliance[]>("/appliances"),
        apiFetch<ProblemType[]>("/problem-types"),
      ]);
      setAppliances(appliancesData);
      setProblemTypes(problemTypesData);
    } catch (error) {
      console.error("Failed to fetch form data:", error);
    }
  };

  const handleLocationSelect = useCallback((lat: number, lng: number, address?: string) => {
    setEditLocation({ lat, lng, address: address || "" });
  }, []);

  const handleUpdateTicket = async (formData: FormData) => {
    if (!editingTicket) return;

    const data = {
      appliance_id: Number(formData.get("appliance")),
      problem_type_id: formData.get("problem") ? Number(formData.get("problem")) : undefined,
      brand: (formData.get("brand") as string) || undefined,
      model: (formData.get("model") as string) || undefined,
      description: formData.get("description") as string,
      urgency: (formData.get("urgency") as string) || undefined,
      address: editLocation?.address || (formData.get("address") as string),
      latitude: editLocation?.lat,
      longitude: editLocation?.lng,
      preferred_time_slot: (formData.get("timeSlot") as string) || undefined,
    };

    try {
      await apiFetch(`/tickets/${editingTicket.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      setEditingTicket(null);
      setEditLocation(null);
      fetchData();
    } catch (error) {
      alert("Failed to update ticket");
    }
  };

  const handleCancelTicket = async () => {
    if (!cancelTicketId) return;

    try {
      await apiFetch(`/tickets/${cancelTicketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ new_status: "cancelled" }),
      });
      setCancelTicketId(null);
      fetchData();
    } catch (error) {
      alert("Failed to cancel ticket");
    }
  };

  const openConversation = async (ticketId: string) => {
    try {
      const conversation = await apiFetch<Conversation>("/conversations", {
        method: "POST",
        body: JSON.stringify({ ticket_id: ticketId }),
      });
      router.push(`/dashboard/conversations/${conversation.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Conversation is not available yet");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3.5 h-3.5" />;
      case "assigned":
        return <UserIcon className="w-3.5 h-3.5" />;
      case "in_progress":
        return <Wrench className="w-3.5 h-3.5" />;
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "cancelled":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleEditProfile = (mode: "info" | "email" | "password" = "info") => {
    setProfileForm({
      full_name: user?.full_name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      current_password: "",
      new_password: "",
    });
    setProfileEditMode(mode);
    setEditingProfile(true);
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.current_password) {
      alert("Current password is required to make changes");
      return;
    }

    try {
      const payload: Record<string, string> = {
        current_password: profileForm.current_password,
      };

      if (profileEditMode === "info") {
        payload.full_name = profileForm.full_name;
        payload.phone = profileForm.phone;
      } else if (profileEditMode === "email") {
        payload.email = profileForm.email;
      } else if (profileEditMode === "password") {
        if (!profileForm.new_password || profileForm.new_password.length < 8) {
          alert("New password must be at least 8 characters");
          return;
        }
        payload.new_password = profileForm.new_password;
      }

      const updatedUser = await apiFetch<User>("/auth/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setUser(updatedUser);
      setEditingProfile(false);
      setProfileForm({ full_name: "", phone: "", email: "", current_password: "", new_password: "" });
    } catch (error: unknown) {
      const err = error as { message?: string };
      alert(err.message || "Failed to update profile. Please check your password.");
    }
  };

  const canEditTicket = (status: string) => {
    // Backend allows editing for pending, assigned, and in_progress
    return ["pending", "assigned", "in_progress"].includes(status);
  };

  const canCancelTicket = (status: string) => {
    // Users can cancel tickets that are not completed or already cancelled
    return ["pending", "assigned", "in_progress"].includes(status);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frosted-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-frosted-500 to-frosted-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-ink-900">{user?.full_name}</h1>
            <p className="text-ink-500 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
            {user?.phone && (
              <p className="text-ink-500 flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4" />
                {user.phone}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-4">
              <p className="text-sm text-ink-400">{t("profile.totalTickets")}</p>
              <p className="text-4xl font-bold text-ink-900">{tickets.length}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleEditProfile("info")}
                className="px-4 py-2 bg-frosted-600 text-white rounded-lg hover:bg-frosted-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Edit3 className="w-4 h-4" />
                {t("profile.edit")}
              </button>
              <button
                onClick={() => handleEditProfile("email")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Mail className="w-4 h-4" />
                {t("profile.changeEmail")}
              </button>
              <button
                onClick={() => handleEditProfile("password")}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
              >
                <Key className="w-4 h-4" />
                {t("profile.changePassword")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: t("ticket.status.pending"), value: tickets.filter((t) => t.status === "pending").length, color: "bg-amber-500", icon: Clock },
          { label: t("ticket.status.assigned"), value: tickets.filter((t) => t.status === "assigned").length, color: "bg-blue-500", icon: UserIcon },
          { label: t("ticket.status.in_progress"), value: tickets.filter((t) => t.status === "in_progress").length, color: "bg-indigo-500", icon: Wrench },
          { label: t("ticket.status.completed"), value: tickets.filter((t) => t.status === "completed").length, color: "bg-green-500", icon: CheckCircle2 },
          { label: t("ticket.status.cancelled"), value: tickets.filter((t) => t.status === "cancelled").length, color: "bg-red-500", icon: XCircle },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-ink-500">{stat.label}</span>
                  <p className="text-2xl font-bold text-ink-900">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* My Tickets */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-900">{t("profile.myTickets")}</h2>
      </div>

      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => {
            const ApplianceIcon = getApplianceIcon(ticket.appliance_icon);
            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover"
              >
                {/* Card Header with Appliance */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-frosted-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <ApplianceIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink-900">{translateApplianceName(ticket.appliance_name, ticket.appliance_icon, t)}</p>
                        <p className="text-xs text-ink-400">#{ticket.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(ticket.urgency)}`}>
                      {t(`ticket.urgency.${ticket.urgency || "normal"}`)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Status Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}
                      {t(`ticket.status.${ticket.status}`)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-ink-700 text-sm line-clamp-2 mb-3">{ticket.description}</p>

                  {/* Problem Type */}
                  {ticket.problem_type_label && (
                    <div className="mb-3 flex items-center gap-2 text-sm text-ink-600">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span>{translateProblemLabel(ticket.problem_type_label, t)}</span>
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="space-y-2 text-sm text-ink-500">
                    {/* Address */}
                    {ticket.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-frosted-500" />
                        <span className="line-clamp-1">{ticket.address}</span>
                      </div>
                    )}

                    {/* Phone */}
                    {ticket.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-frosted-500" />
                        <span>{ticket.phone}</span>
                      </div>
                    )}

                    {/* Scheduled Date */}
                    {ticket.scheduled_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-frosted-500" />
                        <span>{new Date(ticket.scheduled_date).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Technician */}
                    {ticket.technician_name && (
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-green-500" />
                        <span className="text-green-700">{ticket.technician_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="flex items-center gap-1.5 text-frosted-600 hover:text-frosted-700 text-sm font-medium transition"
                  >
                    <Eye className="w-4 h-4" />
                    {t("dashboard.viewDetails")}
                  </button>
                  <div className="flex gap-2">
                    {ticket.technician_id && (
                      <button
                        onClick={() => openConversation(ticket.id)}
                        className="p-2 text-ink-500 hover:text-frosted-700 hover:bg-frosted-50 rounded-lg transition"
                    title={t("ticket.openConversation")}
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    {canEditTicket(ticket.status) && (
                      <button
                        onClick={() => handleEditTicket(ticket)}
                        className="p-2 text-ink-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title={t("ticket.edit")}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {canCancelTicket(ticket.status) && (
                      <button
                        onClick={() => setCancelTicketId(ticket.id)}
                        className="p-2 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title={t("ticket.cancel")}
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t("profile.noTickets")}</h3>
          <p className="mt-2 text-gray-500">{t("dashboard.bookServiceCopy")}</p>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-frosted-50 to-frosted-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const IconComp = getApplianceIcon(selectedTicket.appliance_icon);
                    return (
                      <div className="w-14 h-14 bg-frosted-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <IconComp className="w-7 h-7" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm text-frosted-600 font-mono">#{selectedTicket.id.slice(0, 8)}</p>
                    <h2 className="text-xl font-bold text-ink-900">{translateApplianceName(selectedTicket.appliance_name, selectedTicket.appliance_icon, t) || t("ticket.details")}</h2>
                    {selectedTicket.problem_type_label && (
                      <p className="text-sm text-ink-500">{translateProblemLabel(selectedTicket.problem_type_label, t)}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-white rounded-lg transition">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Urgency */}
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(
                    selectedTicket.status
                  )}`}
                >
                  {getStatusIcon(selectedTicket.status)}
                  {t(`ticket.status.${selectedTicket.status}`)}
                </span>
                <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getUrgencyColor(selectedTicket.urgency)}`}>
                  {t(`ticket.urgency.${selectedTicket.urgency || "normal"}`)} {t("ticket.priority")}
                </span>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-ink-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t("ticket.problemDescription")}
                </h3>
                <p className="text-ink-900">{selectedTicket.description}</p>
              </div>

              {/* Appliance Details - Always show */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-indigo-600 uppercase mb-1">{t("ticket.appliance")}</h3>
                  <p className="text-ink-900 font-medium">{translateApplianceName(selectedTicket.appliance_name, selectedTicket.appliance_icon, t)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-amber-600 uppercase mb-1">{t("ticket.problemType")}</h3>
                  <p className="text-ink-900 font-medium">{translateProblemLabel(selectedTicket.problem_type_label, t)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-ink-500 uppercase mb-1">{t("ticket.brand")}</h3>
                  <p className="text-ink-900 font-medium">{selectedTicket.brand || t("ticket.notSpecified")}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-medium text-ink-500 uppercase mb-1">{t("ticket.model")}</h3>
                  <p className="text-ink-900 font-medium">{selectedTicket.model || t("ticket.notSpecified")}</p>
                </div>
              </div>

              {/* Contact & Technician */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Your Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-blue-900">
                      <UserIcon className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{selectedTicket.user_name || user?.full_name || t("ticket.notSpecified")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-900">
                      <Mail className="w-4 h-4 text-blue-500" />
                      {selectedTicket.user_email || user?.email || t("ticket.notSpecified")}
                    </div>
                    <div className="flex items-center gap-2 text-blue-900">
                      <Phone className="w-4 h-4 text-blue-500" />
                      {selectedTicket.phone || t("ticket.notProvided")}
                    </div>
                    <div className="flex items-center gap-2 text-blue-900">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{t("ticket.preferred")}: {selectedTicket.preferred_time_slot || t("ticket.anyTime")}</span>
                    </div>
                    {selectedTicket.scheduled_date && (
                      <div className="flex items-center gap-2 text-blue-900">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {new Date(selectedTicket.scheduled_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Technician Info */}
                <div className={`rounded-xl p-4 ${selectedTicket.technician_name ? "bg-green-50" : "bg-gray-50"}`}>
                  <h3
                    className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                      selectedTicket.technician_name ? "text-green-800" : "text-ink-700"
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    {t("ticket.assignedTechnician")}
                  </h3>
                  {selectedTicket.technician_name ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-900">
                        <UserIcon className="w-4 h-4 text-green-500" />
                        {selectedTicket.technician_name}
                      </div>
                      {selectedTicket.technician_email && (
                        <div className="flex items-center gap-2 text-green-900">
                          <Mail className="w-4 h-4 text-green-500" />
                          {selectedTicket.technician_email}
                        </div>
                      )}
                      {selectedTicket.technician_phone && (
                        <div className="flex items-center gap-2 text-green-900">
                          <Phone className="w-4 h-4 text-green-500" />
                          {selectedTicket.technician_phone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-ink-500 text-sm">No technician assigned yet</p>
                  )}
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {t("ticket.serviceLocation")}
                </h3>
                <p className="text-ink-900 mb-3">{selectedTicket.address}</p>

                {/* Google Maps Embed */}
                {selectedTicket.latitude && selectedTicket.longitude ? (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedTicket.latitude},${selectedTicket.longitude}&zoom=15`}
                    ></iframe>
                    <div className="bg-white p-3 flex items-center justify-between">
                      <span className="text-xs text-ink-500">
                        {t("location.coordinates")}: {selectedTicket.latitude.toFixed(6)}, {selectedTicket.longitude.toFixed(6)}
                      </span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTicket.latitude},${selectedTicket.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-frosted-600 hover:text-frosted-700 text-sm font-medium flex items-center gap-1"
                      >
                        <MapPin className="w-4 h-4" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-xl p-6 text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{t("ticket.noCoordinates")}</p>
                  </div>
                )}
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between text-sm text-ink-500 pt-2 border-t border-gray-100">
                <span>{t("ticket.created")}: {new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              {selectedTicket.technician_id && (
                <button
                  onClick={() => openConversation(selectedTicket.id)}
                  className="px-6 py-2.5 bg-frosted-600 text-white rounded-xl font-medium hover:bg-frosted-700 transition flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {t("ticket.openConversation")}
                </button>
              )}
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                {t("ticket.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-ink-900">{t("ticket.edit")}</h2>
                  <p className="text-sm text-ink-500 mt-1">{t("ticket.updateCopy")}</p>
                </div>
                <button onClick={() => { setEditingTicket(null); setEditLocation(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTicket(new FormData(e.currentTarget));
              }}
              className="p-6 space-y-5"
            >
              {/* Appliance & Problem Type Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("ticket.applianceType")}</label>
                  <select
                    name="appliance"
                    defaultValue={editingTicket.appliance_id}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 bg-white text-gray-900"
                    required
                  >
                    {appliances.map((appliance) => (
                      <option key={appliance.id} value={appliance.id}>
                      {translateApplianceName(appliance.name, appliance.icon, t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("ticket.problemType")}</label>
                  <select
                    name="problem"
                    defaultValue={editingTicket.problem_type_id || ""}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 bg-white text-gray-900"
                  >
                    <option value="">Select problem type</option>
                    {problemTypes
                      .filter((pt) => pt.label && pt.label.trim())
                      .map((pt) => (
                        <option key={pt.id} value={pt.id}>
                          {pt.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Brand & Model Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("ticket.brand")}</label>
                  <input
                    type="text"
                    name="brand"
                    defaultValue={editingTicket.brand || ""}
                    placeholder="e.g., Samsung, LG, Bosch"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("ticket.model")}</label>
                  <input
                    type="text"
                    name="model"
                    defaultValue={editingTicket.model || ""}
                    placeholder="Model number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 text-gray-900 bg-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("ticket.problemDescription")}</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingTicket.description}
                  placeholder="Describe the issue in detail..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 resize-none text-gray-900 bg-white placeholder-gray-400"
                  required
                />
              </div>

              {/* Urgency & Time Slot Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t("ticket.urgencyLevel")}</label>
                  <select
                    name="urgency"
                    defaultValue={editingTicket.urgency || "medium"}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 bg-white text-gray-900"
                  >
                    <option value="low">🟢 Low - Can wait</option>
                    <option value="medium">🟡 Medium - Soon</option>
                    <option value="high">🔴 High - Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <select
                    name="timeSlot"
                    defaultValue={editingTicket.preferred_time_slot || ""}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 bg-white text-gray-900"
                  >
                    <option value="">Select preferred time</option>
                    <option value="Morning (8AM - 12PM)">🌅 Morning (8AM - 12PM)</option>
                    <option value="Afternoon (12PM - 4PM)">☀️ Afternoon (12PM - 4PM)</option>
                    <option value="Evening (4PM - 8PM)">🌆 Evening (4PM - 8PM)</option>
                    <option value="Flexible">📅 Flexible</option>
                  </select>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {t("ticket.serviceLocation")}
                </label>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLat={editLocation?.lat}
                    initialLng={editLocation?.lng}
                    initialAddress={editLocation?.address}
                  />
                </div>
                {editLocation?.address && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    📍 {editLocation.address}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => { setEditingTicket(null); setEditLocation(null); }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-frosted-600 text-white rounded-xl font-medium hover:bg-frosted-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t("ticket.update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Ticket Confirmation Modal */}
      {cancelTicketId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-ink-900 text-center mb-2">{t("ticket.cancelQuestion")}</h2>
              <p className="text-ink-500 text-center mb-6">
                {t("ticket.cancelCopy")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelTicketId(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  {t("ticket.keep")}
                </button>
                <button
                  onClick={handleCancelTicket}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {t("ticket.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-ink-900">
                    {profileEditMode === "info" && t("profile.edit")}
                    {profileEditMode === "email" && t("profile.changeEmail")}
                    {profileEditMode === "password" && t("profile.changePassword")}
                  </h2>
                  <p className="text-sm text-ink-500 mt-1">
                    {profileEditMode === "info" && "Update your personal information"}
                    {profileEditMode === "email" && "Enter your new email address"}
                    {profileEditMode === "password" && "Create a new secure password"}
                  </p>
                </div>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="p-2 text-ink-400 hover:text-ink-600 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Profile Info Fields */}
              {profileEditMode === "info" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 text-gray-900 bg-white placeholder-gray-400"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </>
              )}

              {/* Email Change Field */}
              {profileEditMode === "email" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Enter your new email address"
                    required
                  />
                </div>
              )}

              {/* Password Change Field */}
              {profileEditMode === "password" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={profileForm.new_password}
                    onChange={(e) => setProfileForm({ ...profileForm, new_password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                </div>
              )}

              {/* Current Password - Required for all changes */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Current Password (Required)
                </label>
                <input
                  type="password"
                  value={profileForm.current_password}
                  onChange={(e) => setProfileForm({ ...profileForm, current_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Enter your current password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Your current password is required to confirm changes</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 px-4 py-3 bg-frosted-600 text-white rounded-xl font-medium hover:bg-frosted-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
