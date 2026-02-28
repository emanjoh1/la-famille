"use client";

import { useLanguageContext } from "@/lib/i18n/provider";
import type { TranslationKey } from "@/lib/i18n/provider";

/**
 * Inline translation component for use in server-rendered pages.
 * Renders a translated string as a <span> (or fragment) based on current locale.
 *
 * Usage:
 *   <h1><T k="booking.my_trips" /></h1>
 *   <p><T k="search.results_count" vars={{ count: 12 }} /></p>
 */
export function T({ k, vars }: { k: TranslationKey; vars?: Record<string, string | number> }) {
  const { t } = useLanguageContext();
  return <>{t(k, vars)}</>;
}
