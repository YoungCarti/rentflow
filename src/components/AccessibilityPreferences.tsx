"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "rentflow-accessibility-preferences";

export type TextSizePreference = "default" | "large" | "larger";
export type DensityPreference = "comfortable" | "compact";

export type AccessibilityPreferences = {
  textSize: TextSizePreference;
  density: DensityPreference;
  reduceMotion: boolean;
  highContrast: boolean;
  enhancedFocus: boolean;
  underlineLinks: boolean;
  colorBlindStatuses: boolean;
};

type AccessibilityPreferencesContextValue = {
  preferences: AccessibilityPreferences;
  updatePreference: <Key extends keyof AccessibilityPreferences>(
    key: Key,
    value: AccessibilityPreferences[Key]
  ) => void;
  resetPreferences: () => void;
};

const defaultPreferences: AccessibilityPreferences = {
  textSize: "default",
  density: "comfortable",
  reduceMotion: false,
  highContrast: false,
  enhancedFocus: true,
  underlineLinks: false,
  colorBlindStatuses: false,
};

const AccessibilityPreferencesContext =
  createContext<AccessibilityPreferencesContextValue | null>(null);

function readPreferences() {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultPreferences;
    }

    return {
      ...defaultPreferences,
      ...(JSON.parse(saved) as Partial<AccessibilityPreferences>),
    };
  } catch {
    return defaultPreferences;
  }
}

function applyPreferences(preferences: AccessibilityPreferences) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.textSize = preferences.textSize;
  root.dataset.density = preferences.density;
  root.classList.toggle("a11y-reduce-motion", preferences.reduceMotion);
  root.classList.toggle("a11y-high-contrast", preferences.highContrast);
  root.classList.toggle("a11y-enhanced-focus", preferences.enhancedFocus);
  root.classList.toggle("a11y-underlined-links", preferences.underlineLinks);
  root.classList.toggle("a11y-status-patterns", preferences.colorBlindStatuses);
}

export function AccessibilityPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const hasLoadedSavedPreferences = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const savedPreferences = readPreferences();
      hasLoadedSavedPreferences.current = true;
      setPreferences(savedPreferences);
      applyPreferences(savedPreferences);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    applyPreferences(preferences);

    if (!hasLoadedSavedPreferences.current) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Ignore storage failures; the current page still receives the settings.
    }
  }, [preferences]);

  const value = useMemo<AccessibilityPreferencesContextValue>(
    () => ({
      preferences,
      updatePreference(key, nextValue) {
        setPreferences((current) => ({
          ...current,
          [key]: nextValue,
        }));
      },
      resetPreferences() {
        setPreferences(defaultPreferences);
      },
    }),
    [preferences]
  );

  return (
    <AccessibilityPreferencesContext.Provider value={value}>
      {children}
    </AccessibilityPreferencesContext.Provider>
  );
}

export function useAccessibilityPreferences() {
  const context = useContext(AccessibilityPreferencesContext);

  if (!context) {
    throw new Error(
      "useAccessibilityPreferences must be used within AccessibilityPreferencesProvider."
    );
  }

  return context;
}
