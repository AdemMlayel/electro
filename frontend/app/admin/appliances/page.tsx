"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
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

interface Appliance {
  id: number;
  name: string;
  icon?: string;
}

interface ProblemType {
  id: number;
  appliance_id: number;
  label: string;
}

// Available icons for selection
const availableIcons: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "refrigerator", label: "Refrigerator", Icon: Refrigerator },
  { key: "washing_machine", label: "Washing Machine", Icon: WashingMachine },
  { key: "microwave", label: "Microwave", Icon: Microwave },
  { key: "oven", label: "Oven/Stove", Icon: CookingPot },
  { key: "dishwasher", label: "Dishwasher", Icon: Utensils },
  { key: "ac", label: "Air Conditioner", Icon: AirVent },
  { key: "tv", label: "TV/Monitor", Icon: Tv },
  { key: "vacuum", label: "Vacuum", Icon: Wind },
  { key: "water_heater", label: "Water Heater", Icon: Flame },
  { key: "disposal", label: "Garbage Disposal", Icon: Trash2 },
  { key: "coffee", label: "Coffee Machine", Icon: Coffee },
  { key: "fan", label: "Fan", Icon: Fan },
  { key: "freezer", label: "Freezer", Icon: Snowflake },
  { key: "dryer", label: "Dryer", Icon: Shirt },
  { key: "electrical", label: "Electrical", Icon: Zap },
  { key: "heater", label: "Heater", Icon: Thermometer },
  { key: "speaker", label: "Speaker/Audio", Icon: Speaker },
  { key: "computer", label: "Computer", Icon: Laptop },
  { key: "printer", label: "Printer", Icon: Printer },
  { key: "default", label: "Default", Icon: Plug },
];

// Get icon component by key
const getIconByKey = (key: string | undefined): LucideIcon => {
  const found = availableIcons.find(i => i.key === key);
  return found?.Icon || Plug;
};

// Get icon by appliance name (auto-detect)
const getIconByName = (name: string, iconKey?: string): LucideIcon => {
  // If explicit icon key is set, use it
  if (iconKey && iconKey !== "default") {
    return getIconByKey(iconKey);
  }
  
  const lowerName = name.toLowerCase();
  
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

export default function ApplianceManagement() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);

  // Form states
  const [showApplianceModal, setShowApplianceModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const [editingProblem, setEditingProblem] = useState<ProblemType | null>(null);

  const [applianceForm, setApplianceForm] = useState({ name: "", icon: "" });
  const [problemForm, setProblemForm] = useState({ label: "", appliance_id: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appliancesData, problemTypesData] = await Promise.all([
        apiFetch<Appliance[]>("/admin/appliances"),
        apiFetch<ProblemType[]>("/admin/problem-types"),
      ]);
      setAppliances(appliancesData);
      setProblemTypes(problemTypesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppliance = async () => {
    try {
      await apiFetch("/admin/appliances", {
        method: "POST",
        body: JSON.stringify(applianceForm),
      });
      setShowApplianceModal(false);
      setApplianceForm({ name: "", icon: "" });
      fetchData();
    } catch (error) {
      alert("Failed to create appliance");
    }
  };

  const handleUpdateAppliance = async () => {
    if (!editingAppliance) return;
    try {
      await apiFetch(`/admin/appliances/${editingAppliance.id}`, {
        method: "PUT",
        body: JSON.stringify(applianceForm),
      });
      setEditingAppliance(null);
      setShowApplianceModal(false);
      setApplianceForm({ name: "", icon: "" });
      fetchData();
    } catch (error) {
      alert("Failed to update appliance");
    }
  };

  const handleDeleteAppliance = async (id: number) => {
    if (!confirm("Are you sure? This will also delete all associated problem types.")) return;
    try {
      await apiFetch(`/admin/appliances/${id}`, { method: "DELETE" });
      if (selectedAppliance?.id === id) setSelectedAppliance(null);
      fetchData();
    } catch (error) {
      alert("Failed to delete appliance");
    }
  };

  const handleCreateProblem = async () => {
    try {
      await apiFetch("/admin/problem-types", {
        method: "POST",
        body: JSON.stringify(problemForm),
      });
      setShowProblemModal(false);
      setProblemForm({ label: "", appliance_id: 0 });
      fetchData();
    } catch (error) {
      alert("Failed to create problem type");
    }
  };

  const handleUpdateProblem = async () => {
    if (!editingProblem) return;
    try {
      await apiFetch(`/admin/problem-types/${editingProblem.id}`, {
        method: "PUT",
        body: JSON.stringify({ label: problemForm.label }),
      });
      setEditingProblem(null);
      setShowProblemModal(false);
      setProblemForm({ label: "", appliance_id: 0 });
      fetchData();
    } catch (error) {
      alert("Failed to update problem type");
    }
  };

  const handleDeleteProblem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this problem type?")) return;
    try {
      await apiFetch(`/admin/problem-types/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      alert("Failed to delete problem type");
    }
  };

  const openApplianceModal = (appliance?: Appliance) => {
    if (appliance) {
      setEditingAppliance(appliance);
      setApplianceForm({ name: appliance.name, icon: appliance.icon || "" });
    } else {
      setEditingAppliance(null);
      setApplianceForm({ name: "", icon: "" });
    }
    setShowApplianceModal(true);
  };

  const openProblemModal = (problem?: ProblemType) => {
    if (problem) {
      setEditingProblem(problem);
      setProblemForm({ label: problem.label, appliance_id: problem.appliance_id });
    } else {
      setEditingProblem(null);
      setProblemForm({ label: "", appliance_id: selectedAppliance?.id || 0 });
    }
    setShowProblemModal(true);
  };

  const getFilteredProblemTypes = () => {
    if (!selectedAppliance) return problemTypes;
    return problemTypes.filter((pt) => pt.appliance_id === selectedAppliance.id);
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
        <h1 className="text-3xl font-bold text-ink-900">Appliance Management</h1>
        <p className="text-ink-500 mt-2">Manage appliance types and their associated problems</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appliances Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-blue-50 to-slate-blue-100">
            <div>
              <h2 className="text-xl font-bold text-ink-900">Appliances</h2>
              <p className="text-ink-500 text-sm">{appliances.length} appliance types</p>
            </div>
            <button
              onClick={() => openApplianceModal()}
              className="px-4 py-2 bg-slate-blue-600 text-white rounded-xl font-medium hover:bg-slate-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Appliance
            </button>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
            {appliances.map((appliance) => (
              <div
                key={appliance.id}
                onClick={() => setSelectedAppliance(appliance)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedAppliance?.id === appliance.id
                    ? "bg-slate-blue-100 border-2 border-slate-blue-500"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const IconComponent = getIconByName(appliance.name, appliance.icon);
                      return (
                        <div className={`p-3 rounded-xl ${
                          selectedAppliance?.id === appliance.id
                            ? "bg-slate-blue-500 text-white"
                            : "bg-white text-slate-blue-600"
                        }`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="font-semibold text-ink-900">{appliance.name}</h3>
                      <p className="text-sm text-ink-500">
                        {problemTypes.filter((pt) => pt.appliance_id === appliance.id).length} problem types
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openApplianceModal(appliance);
                      }}
                      className="p-2 text-ink-500 hover:text-slate-blue-600 hover:bg-slate-blue-50 rounded-lg transition"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAppliance(appliance.id);
                      }}
                      className="p-2 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {appliances.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No appliances yet. Add your first appliance!</p>
              </div>
            )}
          </div>
        </div>

        {/* Problem Types Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-frosted-50 to-frosted-100">
            <div>
              <h2 className="text-xl font-bold text-ink-900">Problem Types</h2>
              <p className="text-ink-500 text-sm">
                {selectedAppliance
                  ? `For ${selectedAppliance.name}`
                  : "Select an appliance to filter"}
              </p>
            </div>
            <button
              onClick={() => openProblemModal()}
              disabled={!selectedAppliance}
              className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-2 ${
                selectedAppliance
                  ? "bg-frosted-600 text-white hover:bg-frosted-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Problem
            </button>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
            {getFilteredProblemTypes().map((problem) => {
              const appliance = appliances.find((a) => a.id === problem.appliance_id);
              return (
                <div
                  key={problem.id}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-ink-900">{problem.label}</h3>
                      {!selectedAppliance && appliance && (
                        <p className="text-sm text-ink-500">{appliance.name}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openProblemModal(problem)}
                        className="p-2 text-ink-500 hover:text-frosted-600 hover:bg-frosted-50 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(problem.id)}
                        className="p-2 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {getFilteredProblemTypes().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {selectedAppliance
                    ? "No problem types for this appliance. Add one!"
                    : "Select an appliance to view its problem types."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appliance Modal */}
      {showApplianceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-ink-900 mb-4">
              {editingAppliance ? "Edit Appliance" : "Add New Appliance"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Name</label>
                <input
                  type="text"
                  value={applianceForm.name}
                  onChange={(e) => setApplianceForm({ ...applianceForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-blue-500 bg-white text-gray-900"
                  placeholder="e.g., Washing Machine"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Select Icon</label>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 p-3 bg-gray-50 rounded-xl max-h-[200px] overflow-y-auto">
                  {availableIcons.map(({ key, label, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setApplianceForm({ ...applianceForm, icon: key })}
                      className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        applianceForm.icon === key || (!applianceForm.icon && key === "default")
                          ? "bg-slate-blue-500 text-white ring-2 ring-slate-blue-300"
                          : "bg-white hover:bg-gray-100 text-gray-600"
                      }`}
                      title={label}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-ink-500 mt-2">
                  Selected: <span className="font-medium">{availableIcons.find(i => i.key === (applianceForm.icon || "default"))?.label || "Default"}</span>
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowApplianceModal(false);
                    setEditingAppliance(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-ink-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAppliance ? handleUpdateAppliance : handleCreateAppliance}
                  className="flex-1 px-4 py-3 bg-slate-blue-600 text-white rounded-xl font-medium hover:bg-slate-blue-700 transition"
                >
                  {editingAppliance ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Problem Type Modal */}
      {showProblemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-ink-900 mb-4">
              {editingProblem ? "Edit Problem Type" : "Add New Problem Type"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Problem Label</label>
                <input
                  type="text"
                  value={problemForm.label}
                  onChange={(e) => setProblemForm({ ...problemForm, label: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 bg-white text-gray-900"
                  placeholder="e.g., Not draining water"
                />
              </div>
              {!editingProblem && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Appliance</label>
                  <select
                    value={problemForm.appliance_id}
                    onChange={(e) => setProblemForm({ ...problemForm, appliance_id: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 bg-white text-gray-900"
                  >
                    <option value={0}>Select appliance</option>
                    {appliances.map((appliance) => (
                      <option key={appliance.id} value={appliance.id}>
                        {appliance.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowProblemModal(false);
                    setEditingProblem(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-ink-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editingProblem ? handleUpdateProblem : handleCreateProblem}
                  disabled={!problemForm.label || (!editingProblem && !problemForm.appliance_id)}
                  className="flex-1 px-4 py-3 bg-frosted-600 text-white rounded-xl font-medium hover:bg-frosted-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {editingProblem ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
