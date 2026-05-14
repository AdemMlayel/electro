export type Translator = (key: string) => string;

const applianceIconKeys: Record<string, string> = {
  refrigerator: "appliance.refrigerator",
  washing_machine: "appliance.washingMachine",
  microwave: "appliance.microwave",
  oven: "appliance.oven",
  dishwasher: "appliance.dishwasher",
  ac: "appliance.airConditioner",
  tv: "appliance.tv",
  vacuum: "appliance.vacuum",
  water_heater: "appliance.waterHeater",
  coffee: "appliance.coffeeMachine",
  freezer: "appliance.freezer",
  dryer: "appliance.dryer",
  fan: "appliance.fan",
};

export function applianceTranslationKey(name?: string | null, icon?: string | null): string | null {
  if (icon && applianceIconKeys[icon]) return applianceIconKeys[icon];

  const lowerName = (name || "").toLowerCase();
  if (!lowerName) return null;

  if (lowerName.includes("refriger") || lowerName.includes("fridge") || lowerName.includes("frigo")) return "appliance.refrigerator";
  if (lowerName.includes("washing") || lowerName.includes("washer") || lowerName.includes("lave")) return "appliance.washingMachine";
  if (lowerName.includes("microwave") || lowerName.includes("micro")) return "appliance.microwave";
  if (lowerName.includes("oven") || lowerName.includes("four") || lowerName.includes("stove")) return "appliance.oven";
  if (lowerName.includes("dishwasher") || lowerName.includes("vaisselle")) return "appliance.dishwasher";
  if (lowerName.includes("conditioner") || lowerName.includes("clim") || lowerName === "ac") return "appliance.airConditioner";
  if (lowerName.includes("tv") || lowerName.includes("television") || lowerName.includes("tele")) return "appliance.tv";
  if (lowerName.includes("vacuum") || lowerName.includes("aspirat")) return "appliance.vacuum";
  if (lowerName.includes("water heater") || lowerName.includes("chauffe")) return "appliance.waterHeater";
  if (lowerName.includes("coffee") || lowerName.includes("cafe")) return "appliance.coffeeMachine";
  if (lowerName.includes("freezer") || lowerName.includes("congel")) return "appliance.freezer";
  if (lowerName.includes("dryer") || lowerName.includes("seche")) return "appliance.dryer";
  if (lowerName.includes("fan") || lowerName.includes("ventilat")) return "appliance.fan";

  return null;
}

export function translateApplianceName(
  name: string | null | undefined,
  icon: string | null | undefined,
  t: Translator,
): string {
  const key = applianceTranslationKey(name, icon);
  return key ? t(key) : name || t("common.service");
}

const problemKeys: Record<string, string> = {
  "not cooling": "problem.notCooling",
  "water leakage": "problem.waterLeakage",
  "excessive noise": "problem.excessiveNoise",
  "not spinning": "problem.notSpinning",
  "water not draining": "problem.waterNotDraining",
  "door stuck": "problem.doorStuck",
  "not heating": "problem.notHeating",
  "sparking": "problem.sparking",
  "turntable issue": "problem.turntableIssue",
  "temperature issue": "problem.temperatureIssue",
  "door issue": "problem.doorIssue",
  "not cleaning": "problem.notCleaning",
  "drain issue": "problem.drainIssue",
  "strange noise": "problem.strangeNoise",
  "no display": "problem.noDisplay",
  "sound issue": "problem.soundIssue",
  "power issue": "problem.powerIssue",
  "no suction": "problem.noSuction",
  "motor issue": "problem.motorIssue",
  "battery issue": "problem.batteryIssue",
  "no hot water": "problem.noHotWater",
  "leakage": "problem.leakage",
  "pilot issue": "problem.pilotIssue",
  "no brewing": "problem.noBrewing",
};

export function translateProblemLabel(label: string | null | undefined, t: Translator): string {
  if (!label) return t("ticket.notSpecified");
  const key = problemKeys[label.toLowerCase()];
  return key ? t(key) : label;
}
