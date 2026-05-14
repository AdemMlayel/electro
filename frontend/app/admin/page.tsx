"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalTechnicians: number;
  totalTickets: number;
  pendingTickets: number;
  completedTickets: number;
  totalAppliances: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTechnicians: 0,
    totalTickets: 0,
    pendingTickets: 0,
    completedTickets: 0,
    totalAppliances: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiFetch<DashboardStats>("/admin/stats");
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "from-frosted-500 to-frosted-600",
      bgLight: "bg-frosted-50",
      link: "/admin/users",
    },
    {
      title: "Technicians",
      value: stats.totalTechnicians,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50",
      link: "/admin/users",
    },
    {
      title: "Total Tickets",
      value: stats.totalTickets,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "from-prussian-500 to-prussian-600",
      bgLight: "bg-prussian-50",
      link: "/admin/tickets",
    },
    {
      title: "Pending Tickets",
      value: stats.pendingTickets,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      link: "/admin/tickets?status=pending",
    },
    {
      title: "Completed",
      value: stats.completedTickets,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-emerald-500 to-green-500",
      bgLight: "bg-emerald-50",
      link: "/admin/tickets?status=completed",
    },
    {
      title: "Appliances",
      value: stats.totalAppliances,
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      color: "from-slate-blue-500 to-slate-blue-600",
      bgLight: "bg-slate-blue-50",
      link: "/admin/appliances",
    },
  ];

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
        <h1 className="text-3xl font-bold text-ink-900">Administration Dashboard</h1>
        <p className="text-ink-500 mt-2">Manage clients, service categories, reservations, and platform statistics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            href={stat.link}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">{stat.title}</p>
                <p className="text-3xl font-bold text-ink-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-ink-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/users"
            className="flex items-center p-4 bg-gradient-to-r from-frosted-50 to-frosted-100 rounded-xl hover:from-frosted-100 hover:to-frosted-200 transition-all group"
          >
            <div className="p-3 bg-frosted-500 rounded-lg text-white mr-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-ink-900">Users Management</p>
              <p className="text-sm text-ink-500">View and edit client and technician accounts</p>
            </div>
          </Link>

          <Link
            href="/admin/appliances"
            className="flex items-center p-4 bg-gradient-to-r from-slate-blue-50 to-slate-blue-100 rounded-xl hover:from-slate-blue-100 hover:to-slate-blue-200 transition-all group"
          >
            <div className="p-3 bg-slate-blue-500 rounded-lg text-white mr-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-ink-900">Service Catalog</p>
              <p className="text-sm text-ink-500">Create service categories and upload visuals</p>
            </div>
          </Link>

          <Link
            href="/admin/tickets"
            className="flex items-center p-4 bg-gradient-to-r from-prussian-50 to-prussian-100 rounded-xl hover:from-prussian-100 hover:to-prussian-200 transition-all group"
          >
            <div className="p-3 bg-prussian-500 rounded-lg text-white mr-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-ink-900">Reservations</p>
              <p className="text-sm text-ink-500">Monitor all service bookings</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
