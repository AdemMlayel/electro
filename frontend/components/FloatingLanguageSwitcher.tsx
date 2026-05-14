"use client";

import { Languages } from "lucide-react";
import { Locale, useI18n } from "@/lib/i18n";

const options: Array<{ locale: Locale; labelKey: string; short: string }> = [
  { locale: "en", labelKey: "common.english", short: "EN" },
  { locale: "fr", labelKey: "common.french", short: "FR" },
  { locale: "ar", labelKey: "common.arabic", short: "AR" },
];

export default function FloatingLanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="fixed bottom-4 right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full border border-white/70 bg-white/90 p-1.5 text-ink-700 shadow-lg shadow-ink-900/10 backdrop-blur-md">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-frosted-100 text-frosted-700">
        <Languages className="h-4 w-4" aria-hidden="true" />
      </div>
      <span className="sr-only">{t("common.language")}</span>
      <div className="flex items-center gap-1">
        {options.map((option) => (
          <button
            key={option.locale}
            type="button"
            onClick={() => setLocale(option.locale)}
            className={`h-8 min-w-9 rounded-full px-2.5 text-xs font-bold transition ${
              locale === option.locale
                ? "bg-prussian-700 text-white shadow-sm"
                : "text-ink-500 hover:bg-gray-100 hover:text-ink-900"
            }`}
            title={t(option.labelKey)}
            aria-pressed={locale === option.locale}
          >
            {option.short}
          </button>
        ))}
      </div>
    </div>
  );
}
