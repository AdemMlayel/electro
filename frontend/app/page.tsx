"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface User {
  role: string;
}

export default function HomePage() {
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
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-white/80 hover:text-white font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-frosted-500 to-frosted-600 text-white font-medium rounded-xl hover:from-frosted-600 hover:to-frosted-700 transition-all shadow-lg shadow-frosted-500/30 hover:shadow-frosted-500/50"
                >
                  Get Started
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
                Trusted by 10,000+ customers
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Expert Appliance
                <span className="block bg-gradient-to-r from-frosted-400 via-indigo-400 to-slate-blue-400 bg-clip-text text-transparent">
                  Repair Services
                </span>
              </h1>
              
              <p className="text-lg text-white/70 mb-8 max-w-lg mx-auto lg:mx-0">
                Fast, reliable, and professional repair for all your home appliances. 
                Book a technician in minutes and get your devices working like new.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href={user ? getDashboardLink() : "/register"}
                  className="px-8 py-4 bg-gradient-to-r from-frosted-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-frosted-600 hover:to-indigo-700 transition-all shadow-xl shadow-frosted-500/30 hover:shadow-frosted-500/50 hover:scale-105 transform"
                >
                  {user ? "Open Dashboard" : "Book a Repair Now"}
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/20 transition-all border border-white/20"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/10">
                <div>
                  <p className="text-3xl font-bold text-white">10K+</p>
                  <p className="text-sm text-white/60">Happy Customers</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">500+</p>
                  <p className="text-sm text-white/60">Expert Technicians</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">24/7</p>
                  <p className="text-sm text-white/60">Support Available</p>
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
                      {[
                        { name: "Washing Machine", color: "from-frosted-500 to-frosted-600" },
                        { name: "Refrigerator", color: "from-indigo-500 to-indigo-600" },
                        { name: "Air Conditioner", color: "from-slate-blue-500 to-slate-blue-600" },
                        { name: "Microwave", color: "from-prussian-500 to-prussian-600" },
                        { name: "Dishwasher", color: "from-emerald-500 to-emerald-600" },
                        { name: "TV", color: "from-amber-500 to-amber-600" },
                      ].map((appliance, i) => (
                        <div
                          key={i}
                          className={`aspect-square bg-gradient-to-br ${appliance.color} rounded-2xl p-4 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer`}
                        >
                          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        </div>
                      ))}
                    </div>

                    {/* Ticket Preview */}
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/60 text-sm">Recent Ticket</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Completed</span>
                      </div>
                      <p className="text-white text-sm">Washing machine not draining properly</p>
                      <div className="flex items-center gap-2 mt-3 text-white/50 text-xs">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Fixed in 2 hours
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
                    <p className="text-white text-sm font-medium">Expert Team</p>
                    <p className="text-white/60 text-xs">Ready to help</p>
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
                Why Choose ElectroFix?
              </h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                We provide comprehensive appliance repair services with a focus on quality, 
                speed, and customer satisfaction.
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
                  title: "Fast Response",
                  description: "Get a technician at your doorstep within hours of booking",
                  color: "from-frosted-500 to-frosted-600",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Certified Experts",
                  description: "All technicians are trained and certified professionals",
                  color: "from-indigo-500 to-indigo-600",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Fair Pricing",
                  description: "Transparent pricing with no hidden charges",
                  color: "from-slate-blue-500 to-slate-blue-600",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Warranty",
                  description: "90-day warranty on all repairs and parts",
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
                Ready to Get Started?
              </h2>
              <p className="text-white/70 mb-8 max-w-xl mx-auto">
                Join thousands of satisfied customers who trust ElectroFix for their appliance repair needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={user ? getDashboardLink() : "/register"}
                  className="px-8 py-4 bg-gradient-to-r from-frosted-500 to-indigo-600 text-white font-semibold rounded-2xl hover:from-frosted-600 hover:to-indigo-700 transition-all shadow-xl shadow-frosted-500/30 hover:shadow-frosted-500/50"
                >
                  {user ? "Go to Dashboard" : "Create Free Account"}
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all border border-white/20"
                >
                  Sign In
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
                © 2026 ElectroFix. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-white/50 hover:text-white transition text-sm">Privacy</Link>
                <Link href="#" className="text-white/50 hover:text-white transition text-sm">Terms</Link>
                <Link href="#" className="text-white/50 hover:text-white transition text-sm">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
