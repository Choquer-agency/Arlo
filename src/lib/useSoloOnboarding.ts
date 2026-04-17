"use client";

import { useCallback, useEffect, useState } from "react";

export type BusinessType = "ecommerce" | "service" | "local" | "creator" | "saas";

export type SoloConfig = {
  businessName: string;
  websiteUrl: string;
  ga4PropertyId: string | null;
  businessType: BusinessType;
  /** "I run these platforms" — set in step 4. Connection happens in per-platform integration steps; skipping untoggles. */
  ads: {
    googleAds: boolean;
    metaAds: boolean;
    linkedinAds: boolean;
    tiktokAds: boolean;
  };
  /** Non-ad source connections. Default false; a new user only has whatever they explicitly connect. */
  connections: {
    gsc: boolean;
    shopify: boolean;
    gbp: boolean;
    youtube: boolean;
  };
};

const ONBOARDED_KEY = "arlo-solo-onboarded";
const CONFIG_KEY = "arlo-solo-config";
const TOUR_KEY = "arlo-solo-tour-complete";

// Starting state for a brand-new customer running through onboarding.
// Dashboard sample numbers are hardcoded per section, so a user who finishes
// the wizard with their own name/website still sees the demo data behind it.
const DEFAULT_CONFIG: SoloConfig = {
  businessName: "",
  websiteUrl: "",
  ga4PropertyId: null,
  businessType: "ecommerce",
  ads: { googleAds: false, metaAds: false, linkedinAds: false, tiktokAds: false },
  connections: { gsc: false, shopify: false, gbp: false, youtube: false },
};

type State = {
  hydrated: boolean;
  onboarded: boolean;
  tourComplete: boolean;
  config: SoloConfig;
};

export function useSoloOnboarding() {
  const [state, setState] = useState<State>({
    hydrated: false,
    onboarded: false,
    tourComplete: false,
    config: DEFAULT_CONFIG,
  });

  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
    const tourComplete = localStorage.getItem(TOUR_KEY) === "true";
    const raw = localStorage.getItem(CONFIG_KEY);
    const config: SoloConfig = raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
    setState({ hydrated: true, onboarded, tourComplete, config });
  }, []);

  const finishSetup = useCallback((config: SoloConfig) => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    setState((s) => ({ ...s, onboarded: true, config }));
  }, []);

  const finishTour = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "true");
    setState((s) => ({ ...s, tourComplete: true }));
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(ONBOARDED_KEY);
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(TOUR_KEY);
    setState({
      hydrated: true,
      onboarded: false,
      tourComplete: false,
      config: DEFAULT_CONFIG,
    });
  }, []);

  return { ...state, finishSetup, finishTour, reset };
}
