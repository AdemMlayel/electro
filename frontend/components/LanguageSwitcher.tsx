"use client";

import { Languages } from "lucide-react";
import { Locale, useI18n } from "@/lib/i18n";

const options: Array<{ locale: Locale; labelKey: string; short: string }> = [
  { locale: "en", labelKey: "common.english", short: "EN" },
  { locale: "fr", labelKey: "common.french", short: "FR" },
  { locale: "ar", labelKey: "common.arabic", short: "AR" },
];

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border p-1 ${
        dark ? "border-white/20 bg-white/10 text-white" : "border-gray-200 bg-white/80 text-gray-700"
      }`}
      aria-label={t("common.language")}
    >
      <Languages className="mx-2 h-4 w-4 opacity-70" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.locale}
          type="button"
          onClick={() => setLocale(option.locale)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
            locale === option.locale
              ? dark
                ? "bg-white text-prussian-700"
                : "bg-prussian-600 text-white"
              : dark
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          title={t(option.labelKey)}
        >
          {option.short}
        </button>
      ))}
    </div>
  );
}
