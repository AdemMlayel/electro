"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Appliance, ProblemType } from "@/lib/types";

export default function CreateTicketForm() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [selectedAppliance, setSelectedAppliance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load appliances
    apiFetch<Appliance[]>("/appliances")
      .then(setAppliances)
      .catch((err) => console.error("Failed to load appliances:", err));
  }, []);

  useEffect(() => {
    if (selectedAppliance) {
      apiFetch<ProblemType[]>(`/problem-types?appliance_id=${selectedAppliance}`)
        .then(setProblemTypes)
        .catch((err) => console.error("Failed to load problem types:", err));
    } else {
      setProblemTypes([]);
    }
  }, [selectedAppliance]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      appliance_id: Number(formData.get("appliance")),
      problem_type_id: formData.get("problem") ? Number(formData.get("problem")) : undefined,
      brand: formData.get("brand") as string || undefined,
      model: formData.get("model") as string || undefined,
      description: formData.get("description") as string,
      urgency: formData.get("urgency") as string || undefined,
      address: formData.get("address") as string,
      preferred_time_slot: formData.get("timeSlot") as string || undefined,
    };

    try {
      await apiFetch("/tickets", {
        method: "POST",
        body: JSON.stringify(data),
      });
      // Refresh the page to show new ticket
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Appliance Selection */}
      <div>
        <label htmlFor="appliance" className="block text-sm font-semibold text-gray-900 mb-2">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Appliance Type *
          </span>
        </label>
        <div className="relative">
          <select
            id="appliance"
            name="appliance"
            required
            className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition duration-200"
            onChange={(e) => setSelectedAppliance(Number(e.target.value) || null)}
          >
            <option value="">Choose your appliance...</option>
            {appliances.map((appliance) => (
              <option key={appliance.id} value={appliance.id}>
                {appliance.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Problem Type */}
      <div>
        <label htmlFor="problem" className="block text-sm font-semibold text-gray-900 mb-2">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Problem Type
          </span>
        </label>
        <div className="relative">
          <select
            id="problem"
            name="problem"
            className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition duration-200"
          >
            <option value="">Select a specific problem (optional)</option>
            {problemTypes.map((problem) => (
              <option key={problem.id} value={problem.id}>
                {problem.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand and Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-semibold text-gray-900 mb-2">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Brand
            </span>
          </label>
          <input
            type="text"
            name="brand"
            id="brand"
            placeholder="e.g., Samsung, LG, Bosch"
            className="block w-full px-4 py-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition duration-200"
          />
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-semibold text-gray-900 mb-2">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Model
            </span>
          </label>
          <input
            type="text"
            name="model"
            id="model"
            placeholder="e.g., WM-123, RF-456"
            className="block w-full px-4 py-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition duration-200"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Problem Description *
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          placeholder="Please describe the problem in detail. What symptoms are you experiencing? When did it start? Any error messages?"
          className="block w-full px-4 py-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition duration-200 resize-none"
        />
        <p className="mt-1 text-sm text-gray-500">Be as detailed as possible to help our technicians understand the issue.</p>
      </div>

      {/* Urgency */}
      <div>
        <label htmlFor="urgency" className="block text-sm font-semibold text-gray-900 mb-2">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Urgency Level
          </span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 border-green-200' },
            { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 border-red-200' }
          ].map((option) => (
            <label key={option.value} className="relative">
              <input
                type="radio"
                name="urgency"
                value={option.value}
                defaultChecked={option.value === 'medium'}
                className="sr-only peer"
              />
              <div className={`p-3 text-center border-2 rounded-lg cursor-pointer transition-all duration-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 ${option.color} border-gray-200 hover:border-gray-300`}>
                <div className="font-medium text-sm">{option.label}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Service Address *
          </span>
        </label>
        <input
          type="text"
          name="address"
          id="address"
          required
          placeholder="Enter your full address for service"
          className="block w-full px-4 py-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition duration-200"
        />
      </div>

      {/* Time Slot */}
      <div>
        <label htmlFor="timeSlot" className="block text-sm font-semibold text-gray-900 mb-2">
          <span className="flex items-center">
            <svg className="h-4 w-4 mr-1 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Preferred Time Slot
          </span>
        </label>
        <select
          id="timeSlot"
          name="timeSlot"
          className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition duration-200"
        >
          <option value="">Any time (recommended)</option>
          <option value="morning">Morning (9 AM - 12 PM)</option>
          <option value="afternoon">Afternoon (1 PM - 5 PM)</option>
          <option value="evening">Evening (6 PM - 8 PM)</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Ticket...
            </>
          ) : (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Repair Ticket
            </>
          )}
        </button>
        <p className="mt-3 text-sm text-gray-500 text-center">
          Our technicians will contact you within 24 hours to schedule the repair.
        </p>
      </div>
    </form>
  );
}