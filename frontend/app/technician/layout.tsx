"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { useI18n } from "@/lib/i18n";

const baseTechnicianNavItems = [
  {
    name: "My Tickets",
    href: "/technician",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    name: "Unassigned Tickets",
    href: "/technician/unassigned",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Notifications",
    href: "/technician/notifications",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    name: "Conversations",
    href: "/technician/conversations",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.83L3 20l1.38-3.45A7.637 7.637 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const technicianNavItems = [
    { ...baseTechnicianNavItems[0], name: t("nav.myTickets") },
    { ...baseTechnicianNavItems[1], name: t("nav.unassignedTickets") },
    { ...baseTechnicianNavItems[2], name: t("common.notifications") },
    { ...baseTechnicianNavItems[3], name: t("common.conversations") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="flex">
        <Sidebar
          title={t("nav.technicianPortal")}
          subtitle={t("nav.technicianSubtitle")}
          items={technicianNavItems}
          accentColor="indigo"
        />
        <main className="flex-1 overflow-auto lg:pt-0 pt-14">
          {children}
        </main>
      </div>
    </div>
  );
}
