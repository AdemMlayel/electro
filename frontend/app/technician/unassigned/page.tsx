"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Conversation, PaginatedResponse, Ticket } from "@/lib/types";
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
  Clock,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Phone,
  Calendar,
  Mail,
  X,
  ChevronRight,
  Plus,
  LucideIcon,
} from "lucide-react";

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

export default function UnassignedTickets() {
  const { t } = useI18n();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ticketsData = await apiFetch<PaginatedResponse<Ticket>>("/technician/unassigned");
      setTickets(ticketsData.items);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTicket = async (ticketId: string) => {
    setClaimingId(ticketId);
    try {
      await apiFetch(`/technician/tickets/${ticketId}/claim`, {
        method: "POST",
      });
      const conversation = await apiFetch<Conversation>("/conversations", {
        method: "POST",
        body: JSON.stringify({ ticket_id: ticketId }),
      });
      setTickets(tickets.filter((t) => t.id !== ticketId));
      setSelectedTicket(null);
      router.push(`/technician/conversations/${conversation.id}`);
    } catch (error) {
      alert("Failed to claim ticket");
    } finally {
      setClaimingId(null);
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyBg = (urgency?: string) => {
    switch (urgency) {
      case "high": return "bg-red-50";
      case "medium": return "bg-amber-50";
      case "low": return "bg-green-50";
      default: return "bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink-900">Unassigned Tickets</h1>
            <p className="text-ink-500 mt-2">Browse and claim tickets waiting for a technician</p>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg">
            <span className="text-2xl font-bold">{tickets.length}</span>
            <span className="text-sm ml-2 opacity-90">Available</span>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => {
            const ApplianceIcon = getApplianceIcon(ticket.appliance_icon);
            return (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover"
              >
                {/* Urgency Banner */}
                <div className={`px-4 py-2 flex items-center justify-between ${getUrgencyBg(ticket.urgency)}`}>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getUrgencyColor(ticket.urgency)}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {t(`ticket.urgency.${ticket.urgency || "normal"}`)} {t("ticket.priority")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center">
                      <ApplianceIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-ink-400 font-mono">#{ticket.id.slice(0, 8)}</p>
                      <p className="text-sm font-semibold text-ink-700">{translateApplianceName(ticket.appliance_name, ticket.appliance_icon, t)}</p>
                    </div>
                  </div>

                  {/* Problem Type */}
                  {ticket.problem_type_label && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-lg text-sm text-amber-700 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {translateProblemLabel(ticket.problem_type_label, t)}
                      </span>
                    </div>
                  )}

                  <p className="text-ink-700 text-sm line-clamp-2 mb-4">{ticket.description}</p>

                  <div className="space-y-2 text-sm">
                    {/* Customer */}
                    <div className="flex items-center gap-2 text-ink-600">
                      <UserIcon className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium">{ticket.user_name || "Unknown Customer"}</span>
                    </div>
                    
                    {/* Phone */}
                    {ticket.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        <a href={`tel:${ticket.phone}`} className="text-indigo-600 hover:underline font-medium">{ticket.phone}</a>
                      </div>
                    )}
                    
                    {/* Address */}
                    {ticket.address && (
                      <div className="flex items-start gap-2 text-ink-500">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                        <span className="line-clamp-2">{ticket.address}</span>
                      </div>
                    )}
                    
                    {/* Map Link */}
                    {ticket.latitude && ticket.longitude && (
                      <a 
                        href={`https://www.google.com/maps?q=${ticket.latitude},${ticket.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs ml-6"
                      >
                        <MapPin className="w-3 h-3" />
                        Open in Maps
                      </a>
                    )}
                    
                    {/* Preferred Time */}
                    {ticket.preferred_time_slot && (
                      <div className="flex items-center gap-2 text-ink-500">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>{ticket.preferred_time_slot}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition flex items-center gap-1"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleClaimTicket(ticket.id)}
                    disabled={claimingId === ticket.id}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {claimingId === ticket.id ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Claim Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            There are no unassigned tickets at the moment. Check back later or view your assigned tickets.
          </p>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const IconComp = getApplianceIcon(selectedTicket.appliance_icon);
                    return (
                      <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <IconComp className="w-7 h-7" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm text-indigo-600 font-mono">#{selectedTicket.id.slice(0, 8)}</p>
                    <h2 className="text-xl font-bold text-ink-900">{translateApplianceName(selectedTicket.appliance_name, selectedTicket.appliance_icon, t)}</h2>
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
                <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                  Pending Assignment
                </span>
                <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getUrgencyColor(selectedTicket.urgency)}`}>
                  {selectedTicket.urgency || "normal"} priority
                </span>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-ink-700 mb-2">Problem Description</h3>
                <p className="text-ink-900">{selectedTicket.description}</p>
              </div>

              {/* Brand & Model */}
              {(selectedTicket.brand || selectedTicket.model) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTicket.brand && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-xs font-medium text-ink-500 uppercase mb-1">Brand</h3>
                      <p className="text-ink-900 font-medium">{selectedTicket.brand}</p>
                    </div>
                  )}
                  {selectedTicket.model && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-xs font-medium text-ink-500 uppercase mb-1">Model</h3>
                      <p className="text-ink-900 font-medium">{selectedTicket.model}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-blue-900">
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    {selectedTicket.user_name || "Unknown"}
                  </div>
                  {selectedTicket.user_email && (
                    <div className="flex items-center gap-2 text-blue-900">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <a href={`mailto:${selectedTicket.user_email}`} className="hover:underline">{selectedTicket.user_email}</a>
                    </div>
                  )}
                  {selectedTicket.phone && (
                    <div className="flex items-center gap-2 text-blue-900">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <a href={`tel:${selectedTicket.phone}`} className="font-semibold text-indigo-600 hover:underline text-lg">{selectedTicket.phone}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Info */}
              {(selectedTicket.scheduled_date || selectedTicket.preferred_time_slot) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTicket.scheduled_date && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h3 className="text-xs font-medium text-purple-600 uppercase mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Scheduled Date
                      </h3>
                      <p className="text-purple-900 font-medium">
                        {new Date(selectedTicket.scheduled_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {selectedTicket.preferred_time_slot && (
                    <div className="bg-purple-50 rounded-xl p-4">
                      <h3 className="text-xs font-medium text-purple-600 uppercase mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Preferred Time
                      </h3>
                      <p className="text-purple-900 font-medium">{selectedTicket.preferred_time_slot}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-ink-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Service Location
                </h3>
                <p className="text-ink-900 mb-3">{selectedTicket.address}</p>
                {selectedTicket.latitude && selectedTicket.longitude && (
                  <>
                    <div className="rounded-xl overflow-hidden border border-gray-200 mb-2">
                      <iframe
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedTicket.latitude},${selectedTicket.longitude}&zoom=15`}
                      ></iframe>
                    </div>
                    <a 
                      href={`https://www.google.com/maps?q=${selectedTicket.latitude},${selectedTicket.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                    >
                      <MapPin className="w-4 h-4" />
                      Open in Google Maps
                    </a>
                  </>
                )}
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between text-sm text-ink-500 pt-2 border-t border-gray-100">
                <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
              <button
                onClick={() => handleClaimTicket(selectedTicket.id)}
                disabled={claimingId === selectedTicket.id}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-800 transition shadow-md disabled:opacity-50"
              >
                {claimingId === selectedTicket.id ? "Claiming..." : "Claim This Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
