"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  items: NavItem[];
  accentColor?: string;
}

export default function Sidebar({ title, subtitle, items, accentColor = "prussian" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await apiFetch<User>("/auth/me");
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  const getAccentClasses = () => {
    switch (accentColor) {
      case "frosted":
        return {
          gradient: "from-frosted-600 to-frosted-800",
          active: "bg-frosted-100 text-frosted-800 border-l-4 border-frosted-500",
          hover: "hover:bg-frosted-50 hover:text-frosted-700",
          icon: "text-frosted-500",
          button: "bg-frosted-600 hover:bg-frosted-700",
          avatar: "bg-frosted-500",
        };
      case "indigo":
        return {
          gradient: "from-indigo-600 to-indigo-800",
          active: "bg-indigo-100 text-indigo-800 border-l-4 border-indigo-500",
          hover: "hover:bg-indigo-50 hover:text-indigo-700",
          icon: "text-indigo-500",
          button: "bg-indigo-600 hover:bg-indigo-700",
          avatar: "bg-indigo-500",
        };
      case "slate-blue":
        return {
          gradient: "from-slate-blue-600 to-slate-blue-800",
          active: "bg-slate-blue-100 text-slate-blue-800 border-l-4 border-slate-blue-500",
          hover: "hover:bg-slate-blue-50 hover:text-slate-blue-700",
          icon: "text-slate-blue-500",
          button: "bg-slate-blue-600 hover:bg-slate-blue-700",
          avatar: "bg-slate-blue-500",
        };
      default:
        return {
          gradient: "from-prussian-600 to-prussian-800",
          active: "bg-prussian-100 text-prussian-800 border-l-4 border-prussian-500",
          hover: "hover:bg-prussian-50 hover:text-prussian-700",
          icon: "text-prussian-500",
          button: "bg-prussian-600 hover:bg-prussian-700",
          avatar: "bg-prussian-500",
        };
    }
  };

  const colors = getAccentClasses();

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={`bg-gradient-to-br ${colors.gradient} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? colors.active
                  : `text-gray-600 ${colors.hover}`
              }`}
            >
              <span className={`mr-3 ${isActive ? "" : colors.icon}`}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-100">
        {user ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={`w-10 h-10 ${colors.avatar} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group disabled:opacity-50"
            >
              {loggingOut ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 group-hover:text-red-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        ) : (
          <div className="animate-pulse space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          © 2026 ElectroFix
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-bold text-gray-900">{title}</h1>
        {user && (
          <div className={`w-8 h-8 ${colors.avatar} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
            {user.full_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-white shadow-xl h-screen sticky top-0 flex-col border-r border-gray-100">
        <SidebarContent />
      </div>

      {/* Mobile content spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
