/// <reference types="astro/client" />

type AnalyticsConsentDecision = 'granted' | 'denied';

interface Window {
  dataLayer: unknown[];
  gtag: (...args: unknown[]) => void;
  mmdevMeasurement: {
    getAnalyticsConsent: () => AnalyticsConsentDecision | null;
    setAnalyticsConsent: (analytics: AnalyticsConsentDecision) => {
      persisted: boolean;
      reloading: boolean;
    };
    openPreferences: () => void;
    consumePendingPreferencesOpen: () => boolean;
    hasLoadedGtm: () => boolean;
  };
  turnstile?: {
    reset: () => void;
  };
}
