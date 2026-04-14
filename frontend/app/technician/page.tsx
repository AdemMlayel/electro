"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { PaginatedResponse, Ticket } from "@/lib/types";
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
  Wrench,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Calendar,
  Mail,
  X,
  ChevronRight,
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

export default function TechnicianMyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const data = await apiFetch<PaginatedResponse<Ticket>>(`/technician/tickets${query}`);
      setTickets(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      await apiFetch(`/tickets/${ticketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ new_status: newStatus }),
      });
      fetchTickets();
      setSelectedTicket(null);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleUnassign = async (ticketId: string) => {
    if (!confirm("Are you sure you want to unassign yourself from this ticket?")) return;
    try {
      await apiFetch(`/technician/tickets/${ticketId}/unassign`, {
        method: "POST",
      });
      fetchTickets();
      setSelectedTicket(null);
    } catch (error) {
      alert("Failed to unassign ticket");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress": return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "assigned": return <UserIcon className="w-3.5 h-3.5" />;
      case "in_progress": return <Wrench className="w-3.5 h-3.5" />;
      case "completed": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "cancelled": return <XCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-amber-600 bg-amber-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const statusTabs = [
    { value: "all", label: "All", count: total, icon: Wrench },
    { value: "assigned", label: "Assigned", count: tickets.filter(t => t.status === "assigned").length, icon: UserIcon },
    { value: "in_progress", label: "In Progress", count: tickets.filter(t => t.status === "in_progress").length, icon: Clock },
    { value: "completed", label: "Completed", count: tickets.filter(t => t.status === "completed").length, icon: CheckCircle2 },
  ];

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
        <h1 className="text-3xl font-bold text-ink-900">My Tickets</h1>
        <p className="text-ink-500 mt-2">Manage and track your assigned repair jobs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Assigned", value: tickets.filter(t => t.status === "assigned").length, color: "bg-blue-500", icon: UserIcon },
          { label: "In Progress", value: tickets.filter(t => t.status === "in_progress").length, color: "bg-amber-500", icon: Clock },
          { label: "Completed", value: tickets.filter(t => t.status === "completed").length, color: "bg-green-500", icon: CheckCircle2 },
          { label: "Total", value: total, color: "bg-indigo-500", icon: Wrench },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-ink-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 inline-flex">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === tab.value
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket) => {
          const ApplianceIcon = getApplianceIcon(ticket.appliance_icon);
          return (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                      <ApplianceIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900">{ticket.appliance_name || "Unknown"}</p>
                      <p className="text-xs text-ink-400 font-mono">#{ticket.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getUrgencyColor(ticket.urgency)}`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{ticket.urgency || "normal"}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                {/* Problem Type */}
                {ticket.problem_type_label && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-700">
                      <AlertTriangle className="w-3 h-3" />
                      {ticket.problem_type_label}
                    </span>
                  </div>
                )}

                <p className="text-ink-700 text-sm line-clamp-2 mb-4">{ticket.description}</p>

                <div className="space-y-2 text-sm">
                  {/* Customer Info */}
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
                      <MapPin className="w-4 h-4 mt-0.5 text-red-500" />
                      <span className="truncate">{ticket.address}</span>
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

                  {/* Scheduled Date */}
                  {ticket.scheduled_date && (
                    <div className="flex items-center gap-2 text-ink-500">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>{new Date(ticket.scheduled_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                      {ticket.preferred_time_slot && <span className="text-indigo-600">• {ticket.preferred_time_slot}</span>}
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

                <div className="flex items-center gap-2">
                  {(ticket.status === "assigned" || ticket.status === "in_progress") && (
                    <button
                      onClick={() => handleUnassign(ticket.id)}
                      className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      title="Unassign"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {ticket.status === "assigned" && (
                    <button
                      onClick={() => handleStatusUpdate(ticket.id, "in_progress")}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition"
                    >
                      Start Work
                    </button>
                  )}
                  {ticket.status === "in_progress" && (
                    <button
                      onClick={() => handleStatusUpdate(ticket.id, "completed")}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Wrench className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tickets found</h3>
          <p className="mt-2 text-gray-500">Check the unassigned tickets to claim new jobs.</p>
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
                    <h2 className="text-xl font-bold text-ink-900">{selectedTicket.appliance_name || "Ticket Details"}</h2>
                    {selectedTicket.problem_type_label && (
                      <p className="text-sm text-ink-500">{selectedTicket.problem_type_label}</p>
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
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                  {getStatusIcon(selectedTicket.status)}
                  {selectedTicket.status.replace("_", " ")}
                </span>
                <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                  selectedTicket.urgency === "high" ? "bg-red-100 text-red-800" :
                  selectedTicket.urgency === "medium" ? "bg-amber-100 text-amber-800" :
                  "bg-green-100 text-green-800"
                }`}>
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
                      <a href={`tel:${selectedTicket.phone}`} className="font-semibold text-indigo-600 hover:underline">{selectedTicket.phone}</a>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Info */}
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
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedTicket.latitude},${selectedTicket.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                    >
                      <MapPin className="w-4 h-4" />
                      Get Directions
                    </a>
                  </>
                )}
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between text-sm text-ink-500 pt-2 border-t border-gray-100">
                <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between gap-3">
              <div>
                {(selectedTicket.status === "assigned" || selectedTicket.status === "in_progress") && (
                  <button
                    onClick={() => handleUnassign(selectedTicket.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition"
                  >
                    Unassign Myself
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Close
                </button>
                {selectedTicket.status === "assigned" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedTicket.id, "in_progress")}
                    className="px-6 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition"
                  >
                    Start Working
                  </button>
                )}
                {selectedTicket.status === "in_progress" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedTicket.id, "completed")}
                    className="px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
