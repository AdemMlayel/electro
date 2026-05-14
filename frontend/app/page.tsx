"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  AirVent,
  LucideIcon,
  Microwave,
  Refrigerator,
  Tv,
  Utensils,
  WashingMachine,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { translateApplianceName } from "@/lib/display";

interface User {
  role: string;
}

const showcaseAppliances: Array<{
  name: string;
  color: string;
  Icon: LucideIcon;
}> = [
  { name: "Washing Machine", color: "from-frosted-500 to-frosted-600", Icon: WashingMachine },
  { name: "Refrigerator", color: "from-indigo-500 to-indigo-600", Icon: Refrigerator },
  { name: "Air Conditioner", color: "from-slate-blue-500 to-slate-blue-600", Icon: AirVent },
  { name: "Microwave", color: "from-prussian-500 to-prussian-600", Icon: Microwave },
  { name: "Dishwasher", color: "from-emerald-500 to-emerald-600", Icon: Utensils },
  { name: "TV", color: "from-amber-500 to-amber-600", Icon: Tv },
];

export default function HomePage() {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await apiFetch<User>("/auth/me");
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin": return "/admin";
      case "technician": return "/technician";
      default: return "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-950 via-prussian-900 to-ink-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-frosted-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-slate-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-frosted-400 to-frosted-600 rounded-xl flex items-center justify-center shadow-lg shadow-frosted-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">ElectroFix</span>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-24 h-10 bg-white/10 rounded-xl animate-pulse" />
            ) : user ? (
              <Link
                href={getDashboardLink()}
                className="px-6 py-2.5 bg-gradient-to-r from-frosted-500 to-frosted-600 text-white font-medium rounded-xl hover:from-frosted-600 hover:to-frosted-700 transition-all shadow-lg shadow-frosted-500/30 hover:shadow-frosted-500/50"
              >
                {t("home.goDashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-white/80 hover:text-white font-medium transition"
                >
                  {t("common.signIn")}
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-frosted-500 to-frosted-600 text-white font-medium rounded-xl hover:from-frosted-600 hover:to-frosted-700 transition-all shadow-lg shadow-frosted-500/30 hover:shadow-frosted-500/50"
                >
                  {t("common.getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-frosted-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {t("home.trusted")}
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {t("home.heroLine1")}
                <span className="block bg-gradient-to-r from-frosted-400 via-indigo-400 to-slate-blue-400 bg-clip-text text-transparent">
                  {t("home.heroLine2")}
                </span>
              </h1>
              
              <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto lg:mx-0">
                {t("home.heroCopy")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href={user ? getDashboardLink() : "/register"}
                  className="px-8 py-4 bg-gradient-to-r from-frosted-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-frosted-600 hover:to-indigo-700 transition-all shadow-xl shadow-frosted-500/30 hover:shadow-frosted-500/50 hover:scale-105 transform"
                >
                  {user ? t("home.openDashboard") : t("home.bookNow")}
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/20 transition-all border border-white/20"
                >
                  {t("home.learnMore")}
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10">
                <div>
                  <p className="text-3xl font-bold text-white">10K+</p>
                  <p className="text-sm text-white/60">{t("home.happyCustomers")}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-sm text-white/60">{t("home.expertTechnicians")}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">24/7</p>
                  <p className="text-sm text-white/60">{t("home.support")}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="space-y-6">
                    {/* Appliance Icons Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {showcaseAppliances.map((appliance, i) => {
                        const Icon = appliance.Icon;

                        return (
                        <div
                          key={i}
                          className={`aspect-square bg-gradient-to-br ${appliance.color} rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:scale-110 transition-transform cursor-pointer`}
                        >
                          <span className="self-start rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                            {t("common.repair")}
                          </span>
                          <div className="flex flex-1 items-center justify-center">
                            <Icon className="h-9 w-9 text-white drop-shadow-sm" strokeWidth={1.8} />
                          </div>
                          <p className="text-sm font-semibold leading-tight text-white drop-shadow-sm">
                            {translateApplianceName(appliance.name, null, t)}
                          </p>
                        </div>
                        );
                      })}
                    </div>

                    {/* Ticket Preview */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/60 text-sm">{t("home.recentTicket")}</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">{t("common.completed")}</span>
                      </div>
                      <p className="text-white text-sm">{t("home.ticketExample")}</p>
                      <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t("home.fixedTime")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-4 shadow-xl shadow-green-500/30 animate-bounce">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/20 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white/20 bg-gradient-to-br ${
                        i === 0 ? "from-frosted-400 to-frosted-600" : 
                        i === 1 ? "from-indigo-400 to-indigo-600" : 
                        "from-slate-blue-400 to-slate-blue-600"
                      }`} />
                    ))}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t("home.expertTeam")}</p>
                    <p className="text-white/60 text-xs">{t("home.readyHelp")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-24 bg-gradient-to-b from-transparent to-ink-950/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t("home.why")}
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                {t("home.whyCopy")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: t("home.fastResponse"),
                  description: t("home.fastResponseCopy"),
                  color: "from-frosted-500 to-frosted-600",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: t("home.certified"),
                  description: t("home.certifiedCopy"),
                  color: "from-indigo-500 to-indigo-600",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: t("home.fairPricing"),
                  description: t("home.fairPricingCopy"),
                  color: "from-slate-blue-500 to-slate-blue-600",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: t("home.warranty"),
                  description: t("home.warrantyCopy"),
                  color: "from-prussian-500 to-prussian-600",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-105 transform"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-gradient-to-br from-frosted-600/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t("home.ready")}
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                {t("home.readyCopy")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={user ? getDashboardLink() : "/register"}
                  className="px-8 py-4 bg-gradient-to-r from-frosted-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-frosted-600 hover:to-indigo-700 transition-all shadow-xl shadow-frosted-500/30 hover:shadow-frosted-500/50"
                >
                  {user ? t("home.goDashboard") : t("home.createFree")}
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all border border-white/20"
                >
                  {t("common.signIn")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-frosted-400 to-frosted-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">ElectroFix</span>
              </div>
              <p className="text-white/50 text-sm">
                © 2026 ElectroFix. {t("home.rights")}
              </p>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-white/50 hover:text-white transition text-sm">{t("common.privacy")}</Link>
                <Link href="#" className="text-white/50 hover:text-white transition text-sm">{t("common.terms")}</Link>
                <Link href="#" className="text-white/50 hover:text-white transition text-sm">{t("common.contact")}</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
