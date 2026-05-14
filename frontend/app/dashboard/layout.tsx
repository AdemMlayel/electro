"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { useI18n } from "@/lib/i18n";

const baseUserNavItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Book Service",
    href: "/dashboard/new-ticket",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    name: "My Account",
    href: "/dashboard/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    name: "Conversations",
    href: "/dashboard/conversations",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4-.83L3 20l1.38-3.45A7.637 7.637 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const userNavItems = [
    { ...baseUserNavItems[0], name: t("common.home") },
    { ...baseUserNavItems[1], name: t("nav.bookService") },
    { ...baseUserNavItems[2], name: t("nav.myAccount") },
    { ...baseUserNavItems[3], name: t("common.notifications") },
    { ...baseUserNavItems[4], name: t("common.conversations") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-frosted-50">
      <div className="flex">
        <Sidebar
          title="ElectroFix"
          subtitle={t("nav.clientSubtitle")}
          items={userNavItems}
          accentColor="frosted"
        />
        <main className="flex-1 overflow-auto lg:pt-0 pt-14">
          {children}
        </main>
      </div>
    </div>
  );
}
