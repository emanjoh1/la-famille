"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import fr from "./dictionaries/fr.json";
import en from "./dictionaries/en.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Locale = "fr" | "en";

type Dictionary = typeof fr;

/** Recursively build all valid dot-notation paths for the dictionary. */
type DotPaths<T, Prefix extends string = ""> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? DotPaths<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = DotPaths<Dictionary>;

// ---------------------------------------------------------------------------
// Dictionaries map
// ---------------------------------------------------------------------------

const dictionaries: Record<Locale, Dictionary> = { fr, en };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "la-famille-locale";

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "fr") return stored;
  return "fr";
}

/**
 * Resolve a dot-notation key against a dictionary object.
 *
 * Examples:
 *   getByPath(dict, "nav.home")        -> "Accueil"
 *   getByPath(dict, "hero.title")       -> "Vivez le Cameroun autrement"
 *
 * Returns the key itself when the path cannot be resolved so missing
 * translations are easy to spot during development.
 */
function getByPath(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return path;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : path;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface LanguageContextValue {
  /** Current active locale. */
  locale: Locale;
  /** Switch to a different locale (persisted in localStorage). */
  setLocale: (locale: Locale) => void;
  /**
   * Translate a dot-notation key.
   *
   * Optionally pass `vars` to interpolate `{key}` placeholders:
   *
   * ```ts
   * t("search.results_count", { count: 12 })
   * // => "12 logements trouves"
   * ```
   */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface LanguageProviderProps {
  children: ReactNode;
  /** Override the initial locale (useful for testing / SSR hints). */
  defaultLocale?: Locale;
}

export function LanguageProvider({ children, defaultLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale ?? "fr");
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount (client only).
  useEffect(() => {
    if (!defaultLocale) {
      setLocaleState(getStoredLocale());
    }
    setMounted(true);
  }, [defaultLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    // Update the <html lang> attribute so assistive technologies pick it up.
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const dict = dictionaries[locale];
      let value = getByPath(dict as unknown as Record<string, unknown>, key);

      if (vars) {
        for (const [varKey, varValue] of Object.entries(vars)) {
          value = value.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(varValue));
        }
      }

      return value;
    },
    [locale],
  );

  // Prevent hydration mismatch: render nothing extra until mounted.
  // Children still render so the layout doesn't shift; translations just
  // default to French until localStorage is read.
  if (!mounted && !defaultLocale) {
    // Still render children with the default (fr) translations so there is
    // no layout flash. The locale will update on the next tick if needed.
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Raw context hook (used internally by use-dict)
// ---------------------------------------------------------------------------

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error(
      "useLanguageContext must be used within a <LanguageProvider>. " +
        "Wrap your application (or layout) with <LanguageProvider>.",
    );
  }
  return ctx;
}
