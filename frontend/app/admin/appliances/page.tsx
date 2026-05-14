"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { apiFetch, resolveMediaUrl } from "@/lib/api";
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
  ImagePlus,
  LucideIcon,
  Upload,
} from "lucide-react";

interface Appliance {
  id: number;
  name: string;
  icon?: string;
  image_url?: string | null;
}

interface ProblemType {
  id: number;
  appliance_id: number;
  label: string;
}

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

const getIconByKey = (key?: string): LucideIcon => {
  const found = availableIcons.find((icon) => icon.key === key);
  return found?.Icon || Plug;
};

const getIconByName = (name: string, iconKey?: string): LucideIcon => {
  if (iconKey && iconKey !== "default") {
    return getIconByKey(iconKey);
  }

  const lowerName = name.toLowerCase();

  if (lowerName.includes("fridge") || lowerName.includes("refriger") || lowerName.includes("frigo")) {
    return Refrigerator;
  }
  if (lowerName.includes("wash") || (lowerName.includes("lave") && lowerName.includes("linge"))) {
    return WashingMachine;
  }
  if (lowerName.includes("micro") || lowerName.includes("onde")) {
    return Microwave;
  }
  if (lowerName.includes("oven") || lowerName.includes("stove") || lowerName.includes("four")) {
    return CookingPot;
  }
  if (lowerName.includes("dish") || lowerName.includes("vaisselle")) {
    return Utensils;
  }
  if (lowerName.includes("air") || lowerName.includes("ac") || lowerName.includes("clim")) {
    return AirVent;
  }
  if (lowerName.includes("tv") || lowerName.includes("television")) {
    return Tv;
  }
  if (lowerName.includes("vacuum") || lowerName.includes("aspirat")) {
    return Wind;
  }
  if (lowerName.includes("water") || lowerName.includes("chauffe") || lowerName.includes("boiler")) {
    return Flame;
  }
  if (lowerName.includes("coffee")) {
    return Coffee;
  }
  if (lowerName.includes("fan") || lowerName.includes("ventilat")) {
    return Fan;
  }
  if (lowerName.includes("freez")) {
    return Snowflake;
  }
  if (lowerName.includes("dryer")) {
    return Shirt;
  }

  return Plug;
};

export default function ApplianceManagement() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppliance, setSelectedAppliance] = useState<Appliance | null>(null);

  const [showApplianceModal, setShowApplianceModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const [editingProblem, setEditingProblem] = useState<ProblemType | null>(null);

  const [applianceForm, setApplianceForm] = useState({ name: "", icon: "" });
  const [problemForm, setProblemForm] = useState({ label: "", appliance_id: 0 });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [savingAppliance, setSavingAppliance] = useState(false);
  const [uploadingApplianceId, setUploadingApplianceId] = useState<number | null>(null);

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
      setSelectedAppliance((current) =>
        current ? appliancesData.find((appliance) => appliance.id === current.id) ?? null : current
      );
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetApplianceModal = () => {
    setShowApplianceModal(false);
    setEditingAppliance(null);
    setApplianceForm({ name: "", icon: "" });
    setSelectedImageFile(null);
    setSavingAppliance(false);
  };

  const uploadApplianceImage = async (applianceId: number, file: File): Promise<Appliance> => {
    const formData = new FormData();
    formData.append("file", file);

    return apiFetch<Appliance>(`/admin/appliances/${applianceId}/upload`, {
      method: "POST",
      body: formData,
    });
  };

  const handleApplianceImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedImageFile(event.target.files?.[0] ?? null);
  };

  const handleCreateAppliance = async () => {
    if (!applianceForm.name.trim()) {
      alert("Service name is required.");
      return;
    }

    if (!selectedImageFile) {
      alert("An image upload is required for each service category.");
      return;
    }

    setSavingAppliance(true);

    try {
      const created = await apiFetch<Appliance>("/admin/appliances", {
        method: "POST",
        body: JSON.stringify({
          name: applianceForm.name.trim(),
          icon: applianceForm.icon || null,
        }),
      });

      await uploadApplianceImage(created.id, selectedImageFile);
      resetApplianceModal();
      await fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create service category");
      setSavingAppliance(false);
    }
  };

  const handleUpdateAppliance = async () => {
    if (!editingAppliance) return;

    setSavingAppliance(true);

    try {
      await apiFetch(`/admin/appliances/${editingAppliance.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: applianceForm.name.trim(),
          icon: applianceForm.icon || null,
        }),
      });

      if (selectedImageFile) {
        await uploadApplianceImage(editingAppliance.id, selectedImageFile);
      }

      resetApplianceModal();
      await fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update service category");
      setSavingAppliance(false);
    }
  };

  const handleQuickUpload = async (applianceId: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploadingApplianceId(applianceId);

    try {
      await uploadApplianceImage(applianceId, file);
      await fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploadingApplianceId(null);
    }
  };

  const handleDeleteAppliance = async (id: number) => {
    if (!confirm("Are you sure? This will also delete all associated problem types.")) return;

    try {
      await apiFetch(`/admin/appliances/${id}`, { method: "DELETE" });
      if (selectedAppliance?.id === id) setSelectedAppliance(null);
      await fetchData();
    } catch (error) {
      alert("Failed to delete service category");
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
      await fetchData();
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
      await fetchData();
    } catch (error) {
      alert("Failed to update problem type");
    }
  };

  const handleDeleteProblem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this problem type?")) return;

    try {
      await apiFetch(`/admin/problem-types/${id}`, { method: "DELETE" });
      await fetchData();
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

    setSelectedImageFile(null);
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
    return problemTypes.filter((problemType) => problemType.appliance_id === selectedAppliance.id);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">Service Catalog</h1>
        <p className="text-ink-500 mt-2">
          Manage service categories, upload a visual for each one, and organize available problem types.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div className="flex items-start gap-3">
          <ImagePlus className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Course requirement reminder</p>
            <p className="text-sm text-amber-800">
              Every service category should include an uploaded image. New categories require an image before they can be saved.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-blue-50 to-slate-blue-100">
            <div>
              <h2 className="text-xl font-bold text-ink-900">Service Categories</h2>
              <p className="text-ink-500 text-sm">{appliances.length} categories</p>
            </div>
            <button
              onClick={() => openApplianceModal()}
              className="px-4 py-2 bg-slate-blue-600 text-white rounded-xl font-medium hover:bg-slate-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Service
            </button>
          </div>

          <div className="p-4 max-h-[640px] overflow-y-auto space-y-4">
            {appliances.map((appliance) => {
              const IconComponent = getIconByName(appliance.name, appliance.icon);
              const imageUrl = resolveMediaUrl(appliance.image_url);
              const hasImage = Boolean(imageUrl);

              return (
                <div
                  key={appliance.id}
                  onClick={() => setSelectedAppliance(appliance)}
                  className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden ${
                    selectedAppliance?.id === appliance.id
                      ? "border-slate-blue-500 shadow-md"
                      : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="aspect-[16/7] bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={appliance.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
                        <IconComponent className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-xl bg-white text-slate-blue-600 shadow-sm">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-ink-900">{appliance.name}</h3>
                          <p className="text-sm text-ink-500">
                            {problemTypes.filter((problemType) => problemType.appliance_id === appliance.id).length} problem types
                          </p>
                          <span
                            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              hasImage
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {hasImage ? "Image uploaded" : "Upload required"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-blue-700 bg-slate-blue-50 hover:bg-slate-blue-100 transition"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Upload className="w-4 h-4" />
                          {uploadingApplianceId === appliance.id ? "Uploading..." : hasImage ? "Replace" : "Upload"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={(event) => handleQuickUpload(appliance.id, event)}
                          />
                        </label>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openApplianceModal(appliance);
                          }}
                          className="p-2 text-ink-500 hover:text-slate-blue-600 hover:bg-slate-blue-50 rounded-lg transition"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
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
                </div>
              );
            })}

            {appliances.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No service categories yet. Add your first one.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-frosted-50 to-frosted-100">
            <div>
              <h2 className="text-xl font-bold text-ink-900">Problem Types</h2>
              <p className="text-ink-500 text-sm">
                {selectedAppliance ? `For ${selectedAppliance.name}` : "Select a service category to filter"}
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

          <div className="p-4 max-h-[640px] overflow-y-auto space-y-3">
            {getFilteredProblemTypes().map((problem) => {
              const appliance = appliances.find((item) => item.id === problem.appliance_id);

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
                    ? "No problem types for this category yet. Add one."
                    : "Select a service category to view its problem types."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showApplianceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-ink-900 mb-4">
              {editingAppliance ? "Edit Service Category" : "Add Service Category"}
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Service Name</label>
                <input
                  type="text"
                  value={applianceForm.name}
                  onChange={(event) => setApplianceForm({ ...applianceForm, name: event.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-blue-500 bg-white text-gray-900"
                  placeholder="e.g., Washing Machine Repair"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">Select Icon</label>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 p-3 bg-gray-50 rounded-xl max-h-[220px] overflow-y-auto">
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
                  Selected:{" "}
                  <span className="font-medium">
                    {availableIcons.find((icon) => icon.key === (applianceForm.icon || "default"))?.label || "Default"}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-medium text-ink-900">Category Image</p>
                    <p className="text-sm text-ink-500">
                      {editingAppliance
                        ? "Upload a new image to replace the current one."
                        : "An uploaded image is required for each new service category."}
                    </p>
                  </div>
                  {editingAppliance?.image_url && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      Current image saved
                    </span>
                  )}
                </div>

                {editingAppliance?.image_url && (
                  <img
                    src={resolveMediaUrl(editingAppliance.image_url) ?? ""}
                    alt={editingAppliance.name}
                    className="mb-4 h-40 w-full rounded-xl object-cover border border-gray-200"
                  />
                )}

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-blue-300 bg-white px-4 py-4 text-slate-blue-700 hover:bg-slate-blue-50 transition">
                  <Upload className="h-5 w-5" />
                  <span>{selectedImageFile ? selectedImageFile.name : "Choose image file"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleApplianceImageSelect}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetApplianceModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-ink-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAppliance ? handleUpdateAppliance : handleCreateAppliance}
                  disabled={savingAppliance || (!editingAppliance && !selectedImageFile)}
                  className="flex-1 px-4 py-3 bg-slate-blue-600 text-white rounded-xl font-medium hover:bg-slate-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {savingAppliance ? "Saving..." : editingAppliance ? "Update Service" : "Create Service"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProblemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-ink-900 mb-4">
              {editingProblem ? "Edit Problem Type" : "Add Problem Type"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Problem Label</label>
                <input
                  type="text"
                  value={problemForm.label}
                  onChange={(event) => setProblemForm({ ...problemForm, label: event.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 bg-white text-gray-900"
                  placeholder="e.g., Not draining water"
                />
              </div>

              {!editingProblem && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Service Category</label>
                  <select
                    value={problemForm.appliance_id}
                    onChange={(event) => setProblemForm({ ...problemForm, appliance_id: Number(event.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-frosted-500 bg-white text-gray-900"
                  >
                    <option value={0}>Select category</option>
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
