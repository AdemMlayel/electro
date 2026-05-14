"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import FloatingLanguageSwitcher from "@/components/FloatingLanguageSwitcher";
import ParticlesBackground from "@/components/ParticlesBackground";
import { I18nProvider } from "@/lib/i18n";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ParticlesBackground />
        <FloatingLanguageSwitcher />
        <div className="relative z-10">{children}</div>
      </I18nProvider>
    </QueryClientProvider>
  );
}
