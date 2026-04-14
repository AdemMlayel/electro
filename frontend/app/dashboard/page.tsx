"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Appliance, PaginatedResponse, Ticket } from "@/lib/types";
import Link from "next/link";
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
  LucideIcon
} from "lucide-react";

// Icon mapping by key (same as admin and new-ticket pages)
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

// Get icon component for an appliance
const getApplianceIcon = (appliance: Appliance): LucideIcon => {
  if (appliance.icon && iconMap[appliance.icon]) {
    return iconMap[appliance.icon];
  }
  
  const lowerName = appliance.name.toLowerCase();
  
  if (lowerName.includes("fridge") || lowerName.includes("refriger") || lowerName.includes("frigo")) {
    return Refrigerator;
  }
  if (lowerName.includes("wash") || lowerName.includes("lave") && lowerName.includes("linge")) {
    return WashingMachine;
  }
  if (lowerName.includes("micro") || lowerName.includes("onde")) {
    return Microwave;
  }
  if (lowerName.includes("oven") || lowerName.includes("stove") || lowerName.includes("four") || lowerName.includes("cuisinière")) {
    return CookingPot;
  }
  if (lowerName.includes("dish") || lowerName.includes("vaisselle")) {
    return Utensils;
  }
  if (lowerName.includes("air") || lowerName.includes("ac") || lowerName.includes("clim")) {
    return AirVent;
  }
  if (lowerName.includes("tv") || lowerName.includes("télé") || lowerName.includes("television")) {
    return Tv;
  }
  if (lowerName.includes("vacuum") || lowerName.includes("aspirat")) {
    return Wind;
  }
  if (lowerName.includes("water") || lowerName.includes("chauffe") || lowerName.includes("boiler")) {
    return Flame;
  }
  if (lowerName.includes("coffee") || lowerName.includes("café")) {
    return Coffee;
  }
  if (lowerName.includes("fan") || lowerName.includes("ventilat")) {
    return Fan;
  }
  if (lowerName.includes("freez") || lowerName.includes("congél")) {
    return Snowflake;
  }
  if (lowerName.includes("dryer") || lowerName.includes("sèche")) {
    return Shirt;
  }
  if (lowerName.includes("light") || lowerName.includes("electr")) {
    return Zap;
  }
  
  return Plug;
};

export default function UserDashboard() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appliancesData, ticketsData] = await Promise.all([
        apiFetch<Appliance[]>("/appliances"),
        apiFetch<PaginatedResponse<Ticket>>("/tickets?limit=3"),
      ]);
      setAppliances(appliancesData);
      setRecentTickets(ticketsData.items);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-indigo-100 text-indigo-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const gradientColors = [
    "from-frosted-500 to-frosted-600",
    "from-slate-blue-500 to-slate-blue-600",
    "from-indigo-500 to-indigo-600",
    "from-prussian-500 to-prussian-600",
    "from-emerald-500 to-emerald-600",
    "from-amber-500 to-amber-600",
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frosted-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">Welcome Back! 👋</h1>
        <p className="text-ink-500 mt-2">What would you like to repair today?</p>
      </div>

      {/* Appliance Cards */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink-900">Choose Your Appliance</h2>
          <Link
            href="/dashboard/new-ticket"
            className="text-frosted-600 hover:text-frosted-700 text-sm font-medium flex items-center gap-1"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {appliances
            .filter((appliance) => {
              const name = appliance.name.toLowerCase();
              return !name.includes("other") && !name.includes("autre") && !name.includes("any") && !name.includes("tout");
            })
            .map((appliance, index) => {
              const IconComponent = getApplianceIcon(appliance);
              return (
            <Link
              key={appliance.id}
              href={`/dashboard/new-ticket?appliance=${appliance.id}`}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center card-hover"
            >
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                <IconComponent className="w-10 h-10" />
              </div>
              <h3 className="font-semibold text-ink-900 text-sm">{appliance.name}</h3>
              <p className="text-xs text-ink-400 mt-1">Request repair</p>
            </Link>
              );
            })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Link
          href="/dashboard/new-ticket"
          className="bg-gradient-to-r from-frosted-500 to-frosted-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Create New Ticket</h3>
              <p className="text-frosted-100 text-sm">Submit a repair request</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-blue-100 rounded-xl text-slate-blue-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-ink-900">My Tickets</h3>
              <p className="text-ink-500 text-sm">View all your requests</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-ink-900">My Profile</h3>
              <p className="text-ink-500 text-sm">Manage your account</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Tickets */}
      {recentTickets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-ink-900">Recent Tickets</h2>
            <Link
              href="/dashboard/profile"
              className="text-frosted-600 hover:text-frosted-700 text-sm font-medium flex items-center gap-1"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-ink-400">#{ticket.id.slice(0, 8)}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-ink-700 text-sm line-clamp-2 mb-4">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-ink-400">
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  <Link
                    href="/dashboard/profile"
                    className="text-frosted-600 hover:text-frosted-700 font-medium"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
