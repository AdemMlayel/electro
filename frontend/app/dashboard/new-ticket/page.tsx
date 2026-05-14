"use client";

import { useState, useEffect, Suspense, useCallback, lazy } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Appliance, ProblemType } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { translateApplianceName, translateProblemLabel } from "@/lib/display";
import dynamic from "next/dynamic";
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

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-frosted-600"></div>
    </div>
  ),
});

// Icon mapping by key (same as admin page)
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

// Get icon component for an appliance (uses saved icon key or auto-detects from name)
const getApplianceIcon = (appliance: Appliance): LucideIcon => {
  // If appliance has a saved icon key, use it
  if (appliance.icon && iconMap[appliance.icon]) {
    return iconMap[appliance.icon];
  }
  
  // Auto-detect from name
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
  
  return Plug;
};

function NewTicketFormContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedAppliance = searchParams.get("appliance");

  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [selectedAppliance, setSelectedAppliance] = useState<number | null>(
    preselectedAppliance ? Number(preselectedAppliance) : null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Map state
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number} | null>(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchAppliances();
  }, []);

  useEffect(() => {
    if (selectedAppliance) {
      fetchProblemTypes(selectedAppliance);
    } else {
      setProblemTypes([]);
    }
  }, [selectedAppliance]);

  const fetchAppliances = async () => {
    try {
      const data = await apiFetch<Appliance[]>("/appliances");
      setAppliances(data);
    } catch (error) {
      console.error("Failed to fetch appliances:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemTypes = async (applianceId: number) => {
    try {
      const data = await apiFetch<ProblemType[]>(`/problem-types?appliance_id=${applianceId}`);
      setProblemTypes(data);
    } catch (error) {
      console.error("Failed to fetch problem types:", error);
    }
  };

  // Handle location selection from map
  const handleLocationSelect = useCallback((lat: number, lng: number, addr?: string) => {
    setSelectedLocation({ lat, lng });
    if (addr) {
      setAddress(addr);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const scheduledDateStr = formData.get("scheduledDate") as string;
    
    const data = {
      appliance_id: Number(formData.get("appliance")),
      problem_type_id: formData.get("problem") ? Number(formData.get("problem")) : undefined,
      brand: formData.get("brand") as string || undefined,
      model: formData.get("model") as string || undefined,
      description: formData.get("description") as string,
      urgency: formData.get("urgency") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      address: address || formData.get("address") as string,
      latitude: selectedLocation?.lat,
      longitude: selectedLocation?.lng,
      preferred_time_slot: formData.get("timeSlot") as string || undefined,
      scheduled_date: scheduledDateStr ? new Date(scheduledDateStr).toISOString() : undefined,
    };

    try {
      await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/profile"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("booking.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frosted-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-ink-900 mb-2">{t("booking.created")}</h2>
          <p className="text-ink-500">{t("booking.redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">{t("booking.title")}</h1>
        <p className="text-ink-500 mt-2">{t("booking.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Appliance Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-frosted-100 rounded-lg flex items-center justify-center text-frosted-600">1</span>
            {t("booking.selectAppliance")}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {appliances
              .filter((appliance) => {
                const name = appliance.name.toLowerCase();
                return !name.includes("other") && !name.includes("autre") && !name.includes("any") && !name.includes("tout");
              })
              .map((appliance) => {
              const IconComponent = getApplianceIcon(appliance);
              return (
              <label
                key={appliance.id}
                className={`relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all ${
                  selectedAppliance === appliance.id
                    ? "bg-frosted-100 border-2 border-frosted-500 shadow-md"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="appliance"
                  value={appliance.id}
                  checked={selectedAppliance === appliance.id}
                  onChange={(e) => setSelectedAppliance(Number(e.target.value))}
                  className="sr-only"
                  required
                />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${
                  selectedAppliance === appliance.id
                    ? "bg-frosted-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className={`text-sm font-medium text-center ${
                  selectedAppliance === appliance.id ? "text-frosted-700" : "text-ink-700"
                }`}>
                  {translateApplianceName(appliance.name, appliance.icon, t)}
                </span>
                {selectedAppliance === appliance.id && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-5 h-5 text-frosted-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
              );
            })}
          </div>
        </div>

        {/* Problem Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-frosted-100 rounded-lg flex items-center justify-center text-frosted-600">2</span>
            {t("booking.problemDetails")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.problemType")}</label>
              <select
                name="problem"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-frosted-500"
              >
                <option value="">{t("booking.selectProblem")}</option>
                {problemTypes.filter(pt => pt.label && pt.label.trim()).map((problem) => (
                  <option key={problem.id} value={problem.id}>
                    {translateProblemLabel(problem.label, t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.brand")}</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g., Samsung"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-ink-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-frosted-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.model")}</label>
                <input
                  type="text"
                  name="model"
                  placeholder="e.g., WF45R6100AW"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-ink-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-frosted-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.description")}</label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder={t("booking.descriptionPlaceholder")}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-ink-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-frosted-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.urgency")}</label>
              <div className="flex gap-3">
                {["low", "medium", "high"].map((level) => (
                  <label key={level} className="flex-1 relative">
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      defaultChecked={level === "medium"}
                      className="sr-only peer"
                    />
                    <div className={`p-3 text-center rounded-xl border-2 cursor-pointer transition-all peer-checked:border-2 ${
                      level === "high" 
                        ? "peer-checked:bg-red-50 peer-checked:border-red-500 peer-checked:text-red-700 hover:bg-red-50"
                        : level === "medium"
                        ? "peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700 hover:bg-amber-50"
                        : "peer-checked:bg-green-50 peer-checked:border-green-500 peer-checked:text-green-700 hover:bg-green-50"
                    } border-gray-200`}>
                      <span className="font-medium">{t(`ticket.urgency.${level}`)}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-frosted-100 rounded-lg flex items-center justify-center text-frosted-600">3</span>
            {t("booking.contactLocation")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.phone")}</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="e.g., +212 6XX XXX XXX"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-ink-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-frosted-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.address")}</label>
              <textarea
                name="address"
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("booking.addressPlaceholder")}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-ink-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-frosted-500 resize-none"
              />
            </div>

            {/* Map Selection with Leaflet */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                {t("booking.mapLabel")}
              </label>
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialAddress={address}
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-ink-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-frosted-100 rounded-lg flex items-center justify-center text-frosted-600">4</span>
            {t("booking.schedule")}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.date")}</label>
              <input
                type="date"
                name="scheduledDate"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-frosted-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">{t("booking.timeSlot")}</label>
              <select
                name="timeSlot"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-frosted-500"
              >
                <option value="">{t("booking.selectTime")}</option>
                <option value="Morning (8AM - 12PM)">{t("booking.morning")}</option>
                <option value="Afternoon (12PM - 4PM)">{t("booking.afternoon")}</option>
                <option value="Evening (4PM - 8PM)">{t("booking.evening")}</option>
                <option value="Flexible">{t("booking.flexible")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedAppliance}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-frosted-500 to-frosted-600 text-white rounded-xl font-medium hover:from-frosted-600 hover:to-frosted-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("booking.creating")}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t("booking.createTicket")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewTicketPage() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-frosted-600"></div>
      </div>
    }>
      <NewTicketFormContent />
    </Suspense>
  );
}
