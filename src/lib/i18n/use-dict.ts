import { useLanguageContext } from "./provider";

/**
 * Hook to access translations and locale switching.
 *
 * Usage:
 * ```tsx
 * const { t, locale, setLocale } = useDict();
 * return <h1>{t("hero.title")}</h1>;
 * ```
 */
export function useDict() {
  return useLanguageContext();
}
