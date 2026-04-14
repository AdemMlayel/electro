"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Ticket, PaginatedResponse, Appliance, User } from "@/lib/types";
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
  AlertCircle,
  MapPin,
  Phone,
  Calendar,
  Mail,
  Eye,
  X,
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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusQuery = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const ticketsData = await apiFetch<PaginatedResponse<Ticket>>(`/admin/tickets?limit=100${statusQuery}`);
      setTickets(ticketsData.items);
      setTotal(ticketsData.total);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "assigned": return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-3.5 h-3.5" />;
      case "assigned": return <UserIcon className="w-3.5 h-3.5" />;
      case "in_progress": return <Wrench className="w-3.5 h-3.5" />;
      case "completed": return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "cancelled": return <XCircle className="w-3.5 h-3.5" />;
      default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-amber-100 text-amber-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      await apiFetch(`/admin/tickets/${ticketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ new_status: newStatus }),
      });
      fetchData();
      setSelectedTicket(null);
    } catch (error) {
      alert("Failed to update status");
    }
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">All Tickets</h1>
        <p className="text-ink-500 mt-2">Manage and monitor all service tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total", value: total, color: "bg-prussian-500", icon: AlertCircle },
          { label: "Pending", value: tickets.filter(t => t.status === "pending").length, color: "bg-amber-500", icon: Clock },
          { label: "Assigned", value: tickets.filter(t => t.status === "assigned").length, color: "bg-blue-500", icon: UserIcon },
          { label: "In Progress", value: tickets.filter(t => t.status === "in_progress").length, color: "bg-indigo-500", icon: Wrench },
          { label: "Completed", value: tickets.filter(t => t.status === "completed").length, color: "bg-green-500", icon: CheckCircle2 },
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

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium text-ink-700">Filter by status:</span>
          {["all", "pending", "assigned", "in_progress", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === status
                  ? "bg-prussian-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Appliance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => {
                const ApplianceIcon = getApplianceIcon(ticket.appliance_icon);
                return (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-ink-500">
                      #{ticket.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-frosted-100 rounded-lg flex items-center justify-center text-frosted-600">
                          <ApplianceIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-ink-900">{ticket.appliance_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{ticket.user_name || "Unknown"}</p>
                        <p className="text-xs text-ink-500">{ticket.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ticket.technician_name ? (
                        <div>
                          <p className="text-sm font-medium text-green-700">{ticket.technician_name}</p>
                          <p className="text-xs text-ink-500">{ticket.technician_email}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-ink-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(ticket.urgency)}`}>
                        {ticket.urgency || "normal"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="flex items-center gap-1 text-prussian-600 hover:text-prussian-800 text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {tickets.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-ink-500">No tickets found</p>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-prussian-50 to-prussian-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(() => {
                    const IconComp = getApplianceIcon(selectedTicket.appliance_icon);
                    return (
                      <div className="w-14 h-14 bg-prussian-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <IconComp className="w-7 h-7" />
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-sm text-prussian-600 font-mono">#{selectedTicket.id.slice(0, 8)}</p>
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
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(selectedTicket.status)}`}>
                  {getStatusIcon(selectedTicket.status)}
                  {selectedTicket.status.replace("_", " ")}
                </span>
                <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getUrgencyColor(selectedTicket.urgency)}`}>
                  {selectedTicket.urgency || "normal"} priority
                </span>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-ink-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Problem Description
                </h3>
                <p className="text-ink-900">{selectedTicket.description}</p>
              </div>

              {/* Appliance Details */}
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

              {/* Customer & Technician */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {selectedTicket.user_email}
                      </div>
                    )}
                    {selectedTicket.phone && (
                      <div className="flex items-center gap-2 text-blue-900">
                        <Phone className="w-4 h-4 text-blue-500" />
                        {selectedTicket.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Technician Info */}
                <div className={`rounded-xl p-4 ${selectedTicket.technician_name ? "bg-green-50" : "bg-gray-50"}`}>
                  <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${selectedTicket.technician_name ? "text-green-800" : "text-ink-700"}`}>
                    <Wrench className="w-4 h-4" />
                    Assigned Technician
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

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedTicket.scheduled_date && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-ink-500 uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Scheduled Date
                    </h3>
                    <p className="text-ink-900 font-medium">
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
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-xs font-medium text-ink-500 uppercase mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Preferred Time
                    </h3>
                    <p className="text-ink-900 font-medium">{selectedTicket.preferred_time_slot}</p>
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
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedTicket.latitude},${selectedTicket.longitude}&zoom=15`}
                    ></iframe>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-amber-800 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {["pending", "assigned", "in_progress", "completed", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedTicket.id, status)}
                      disabled={selectedTicket.status === status}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                        selectedTicket.status === status
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-prussian-100 text-prussian-700 hover:bg-prussian-200"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between text-sm text-ink-500 pt-2 border-t border-gray-100">
                <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
