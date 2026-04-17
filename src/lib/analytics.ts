// GTM dataLayer event tracking utilities

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

const STEP_NAMES = [
  "about_you",
  "about_project",
  "budget_timeline",
  "almost_done",
] as const;

function push(event: string, params: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({ event, ...params });
  }
}

export function trackCtaClick(
  location: string,
  text: string,
  pricingTier?: string,
) {
  push("cta_click", {
    cta_location: location,
    cta_text: text,
    pricing_tier: pricingTier,
  });
}

export function trackFormOpen(
  source?: string,
  packageInfo?: { packageName: string; estimatedTotal: string },
) {
  push("form_open", {
    form_source: source,
    pricing_tier: packageInfo?.packageName,
    pricing_range: packageInfo?.estimatedTotal,
  });
}

export function trackFormStep(stepNumber: number) {
  push("form_step", {
    step_number: stepNumber,
    step_name: STEP_NAMES[stepNumber] ?? `step_${stepNumber}`,
  });
}

export function trackFormSubmit(data: {
  projectType: string;
  budget: string;
  companySize: string;
  timeline: string;
  referral: string;
  hasPackage: boolean;
  pricingTier?: string;
}) {
  push("generate_lead", {
    project_type: data.projectType,
    budget: data.budget,
    company_size: data.companySize,
    timeline: data.timeline,
    referral: data.referral,
    has_package: data.hasPackage,
    pricing_tier: data.pricingTier,
  });
}

export function trackFormAbandon(lastStep: number, hasPackage: boolean) {
  push("form_abandon", {
    last_step: lastStep,
    last_step_name: STEP_NAMES[lastStep] ?? `step_${lastStep}`,
    has_package: hasPackage,
  });
}

export function trackPricingClick(
  tierName: string,
  priceRange: string,
  isRetainer: boolean,
) {
  push("pricing_click", {
    pricing_tier: tierName,
    pricing_range: priceRange,
    is_retainer: isRetainer,
  });
}

export function trackFaqToggle(question: string, index: number) {
  push("faq_toggle", {
    faq_question: question,
    faq_index: index,
  });
}
