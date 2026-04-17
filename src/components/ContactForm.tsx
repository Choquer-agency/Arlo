"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { gsap } from "@/lib/gsap-register";
import { submitForm } from "@/lib/form";
import { useContactForm, type ContactFormMode } from "@/context/ContactFormContext";
import { Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import { clsx } from "clsx";
import { AGENCY_NAME } from "@/lib/siteConfig";
import { trackFormStep, trackFormSubmit, trackFormAbandon } from "@/lib/analytics";

// ── Option lists ────────────────────────────────────────────

const referralSources = [
  "AI assistant (ChatGPT, Claude, Perplexity, etc.)",
  "Google search",
  "LinkedIn",
  "Referred by someone",
  "Conference or event",
  "Blog or article",
  "Other",
];

const companySizes = [
  "1–10 people",
  "11–50 people",
  "51–200 people",
  "201–500 people",
  "500+ people",
];

const clientRanges = [
  "1–10 clients",
  "11–50 clients",
  "51–100 clients",
  "101–500 clients",
  "500+ clients",
];

const timelines = [
  "Just exploring",
  "Rolling this out this quarter",
  "Rolling this out this month",
  "Urgent / signed already",
];

const monthlyBudgets = [
  "< $500 / month",
  "$500 – $2,000 / month",
  "$2,000 – $5,000 / month",
  "$5,000 – $10,000 / month",
  "$10,000+ / month",
];

const enterpriseFeatureOptions = [
  "SSO / SAML",
  "Data residency (EU / other region)",
  "Self-host / on-prem",
  "Custom connectors",
  "Dedicated CSM",
  "24hr SLA support",
  "Volume / enterprise discount",
];

// ── Shared state type ───────────────────────────────────────

interface FormData {
  // common
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  referral: string;
  notes: string;
  _gotcha: string;

  // general
  question: string;

  // enterprise
  companySize: string;
  clientCount: string;
  teamSize: string;
  currentTools: string;
  neededFeatures: string[];
  timeline: string;
  monthlyBudget: string;
}

const emptyForm: FormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "",
  referral: "",
  notes: "",
  _gotcha: "",
  question: "",
  companySize: "",
  clientCount: "",
  teamSize: "",
  currentTools: "",
  neededFeatures: [],
  timeline: "",
  monthlyBudget: "",
};

// ── UI ──────────────────────────────────────────────────────

const GENERAL_SLIDES = 2;
const ENTERPRISE_SLIDES = 4;

function ProgressIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "h-1.5 rounded-full transition-all",
            i === current
              ? "w-8 bg-brand"
              : i < current
                ? "w-4 bg-brand/40"
                : "w-4 bg-dark/10"
          )}
          style={{ transitionDuration: "0.3s" }}
        />
      ))}
      <span className="ml-3 font-mono text-xs text-dark opacity-40">
        {current + 1} / {total}
      </span>
    </div>
  );
}

export function ContactFormModal() {
  const { isOpen, mode, closeModal, packageInfo } = useContactForm();
  const totalSlides = mode === "enterprise" ? ENTERPRISE_SLIDES : GENERAL_SLIDES;

  const mountTime = useRef(Date.now());
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>(emptyForm);

  const handleClose = useCallback(() => {
    if (!isSuccess && currentSlide > 0) {
      trackFormAbandon(currentSlide, !!packageInfo);
    }
    if (isSuccess) {
      setCurrentSlide(0);
      setIsSuccess(false);
      setErrors({});
      setFormData(emptyForm);
    }
    closeModal();
  }, [isSuccess, currentSlide, packageInfo, closeModal]);

  // Reset slide index when mode switches
  useEffect(() => {
    setCurrentSlide(0);
    setErrors({});
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      mountTime.current = Date.now();
      trackFormStep(0);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) handleClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        modalRef.current,
        { y: 40, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [isOpen]);

  function validateSlide(index: number): boolean {
    const e: Record<string, string> = {};
    if (mode === "general") {
      if (index === 0) {
        if (!formData.name.trim()) e.name = "Name is required";
        if (!formData.email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          e.email = "Please enter a valid email";
      } else if (index === 1) {
        if (!formData.question.trim()) e.question = "Please tell us what you need help with";
      }
    } else {
      if (index === 0) {
        if (!formData.name.trim()) e.name = "Name is required";
        if (!formData.email.trim()) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          e.email = "Please enter a valid email";
        if (!formData.company.trim()) e.company = "Company / agency name is required";
        if (!formData.role.trim()) e.role = "Your role helps us route you right";
      } else if (index === 1) {
        if (!formData.clientCount) e.clientCount = "How many clients do you manage?";
      } else if (index === 2) {
        if (!formData.timeline) e.timeline = "Timeline helps us prioritize";
      } else if (index === 3) {
        if (!formData.monthlyBudget) e.monthlyBudget = "Approximate budget helps us scope your quote";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function animateSlide(direction: "next" | "back", cb: () => void) {
    if (!slideRef.current || isAnimating.current) return;
    isAnimating.current = true;
    const xOut = direction === "next" ? -60 : 60;
    const xIn = direction === "next" ? 60 : -60;
    gsap.to(slideRef.current, {
      x: xOut,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        cb();
        gsap.set(slideRef.current, { x: xIn });
        gsap.to(slideRef.current, {
          x: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power3.out",
          onComplete: () => {
            isAnimating.current = false;
          },
        });
      },
    });
  }

  function goNext() {
    if (!validateSlide(currentSlide)) return;
    trackFormStep(currentSlide + 1);
    animateSlide("next", () => setCurrentSlide((s) => s + 1));
  }

  function goBack() {
    animateSlide("back", () => setCurrentSlide((s) => s - 1));
  }

  async function handleSubmit() {
    if (formData._gotcha || Date.now() - mountTime.current < 3000) return;
    if (!validateSlide(currentSlide)) return;
    setIsSubmitting(true);
    try {
      await submitForm({
        ...formData,
        neededFeatures: formData.neededFeatures.join(", "),
        mode,
        selectedPackage: packageInfo?.packageName || "",
        websiteSource: AGENCY_NAME,
        submittedAt: new Date().toISOString(),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      });
      setIsSuccess(true);
      trackFormSubmit({
        projectType: mode,
        budget: formData.monthlyBudget,
        companySize: formData.companySize,
        timeline: formData.timeline,
        referral: formData.referral,
        hasPackage: !!packageInfo,
        pricingTier: packageInfo?.packageName,
      });
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string])
      setErrors((prev) => ({ ...prev, [field as string]: "" }));
  }

  function toggleFeature(feature: string) {
    setFormData((prev) => {
      const has = prev.neededFeatures.includes(feature);
      return {
        ...prev,
        neededFeatures: has
          ? prev.neededFeatures.filter((f) => f !== feature)
          : [...prev.neededFeatures, feature],
      };
    });
  }

  if (!isOpen) return null;

  const inputClasses =
    "w-full px-4 py-3 rounded-md border border-dark-faded bg-light text-dark placeholder:text-dark/30 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-fluid-main font-sans";
  const selectClasses =
    "w-full px-4 py-3 rounded-md border border-dark-faded bg-light text-dark focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-fluid-main font-sans appearance-none";
  const labelClasses = "block text-sm font-sans font-medium text-dark mb-1.5";
  const errorClasses = "text-bg-red text-xs mt-1 font-sans";

  function renderGeneralSlide() {
    switch (currentSlide) {
      case 0:
        return (
          <div>
            <h3 className="font-sans font-medium text-fluid-h4 text-dark mb-2">Ask us anything</h3>
            <p className="font-sans text-fluid-main text-dark opacity-40 mb-6">
              Questions about ARLO? Send them over — we reply inside a business day.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Full Name *</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Alex Chen"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                {errors.name && <p className={errorClasses}>{errors.name}</p>}
              </div>
              <div>
                <label className={labelClasses}>Email *</label>
                <input
                  type="email"
                  className={inputClasses}
                  placeholder="alex@agency.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
                {errors.email && <p className={errorClasses}>{errors.email}</p>}
              </div>
              <div>
                <label className={labelClasses}>Company</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Northpoint Digital"
                  value={formData.company}
                  onChange={(e) => updateField("company", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClasses}>Your role</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Account Manager"
                  value={formData.role}
                  onChange={(e) => updateField("role", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h3 className="font-sans font-medium text-fluid-h4 text-dark mb-2">Your question</h3>
            <p className="font-sans text-fluid-main text-dark opacity-40 mb-6">
              Detail helps us respond with specifics on the first reply.
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>What can we help with? *</label>
                <textarea
                  className={`${inputClasses} resize-none`}
                  rows={6}
                  placeholder="e.g. Can ARLO connect to Klaviyo yet? / How does team billing work? / Is there an annual discount?"
                  value={formData.question}
                  onChange={(e) => updateField("question", e.target.value)}
                />
                {errors.question && <p className={errorClasses}>{errors.question}</p>}
              </div>
              <div>
                <label className={labelClasses}>How did you find us?</label>
                <select
                  className={selectClasses}
                  value={formData.referral}
                  onChange={(e) => updateField("referral", e.target.value)}
                >
                  <option value="">Select...</option>
                  {referralSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
              {errors.submit && (
                <p className="text-bg-red text-sm mt-4 font-sans">{errors.submit}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  function renderEnterpriseSlide() {
    switch (currentSlide) {
      case 0:
        return (
          <div>
            <h3 className="font-sans font-medium text-fluid-h4 text-dark mb-2">
              Enterprise inquiry
            </h3>
            <p className="font-sans text-fluid-main text-dark opacity-40 mb-6">
              A few details and we&apos;ll come back with a custom quote for SSO / SLA / self-host.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Full Name *</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Alex Chen"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
                {errors.name && <p className={errorClasses}>{errors.name}</p>}
              </div>
              <div>
                <label className={labelClasses}>Email *</label>
                <input
                  type="email"
                  className={inputClasses}
                  placeholder="alex@agency.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
                {errors.email && <p className={errorClasses}>{errors.email}</p>}
              </div>
              <div>
                <label className={labelClasses}>Phone</label>
                <input
                  type="tel"
                  className={inputClasses}
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClasses}>Company / agency *</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Northpoint Digital"
                  value={formData.company}
                  onChange={(e) => updateField("company", e.target.value)}
                />
                {errors.company && <p className={errorClasses}>{errors.company}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClasses}>Your role *</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Managing Partner / Head of Ops / CISO"
                  value={formData.role}
                  onChange={(e) => updateField("role", e.target.value)}
                />
                {errors.role && <p className={errorClasses}>{errors.role}</p>}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h3 className="font-sans font-medium text-fluid-h4 text-dark mb-2">Your agency</h3>
            <p className="font-sans text-fluid-main text-dark opacity-40 mb-6">
              Helps us size the plan and team seats correctly.
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Agency size</label>
                <select
                  className={selectClasses}
                  value={formData.companySize}
                  onChange={(e) => updateField("companySize", e.target.value)}
                >
                  <option value="">Select...</option>
                  {companySizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Number of clients *</label>
                <select
                  className={selectClasses}
                  value={formData.clientCount}
                  onChange={(e) => updateField("clientCount", e.target.value)}
                >
                  <option value="">Select...</option>
                  {clientRanges.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.clientCount && <p className={errorClasses}>{errors.clientCount}</p>}
              </div>
              <div>
                <label className={labelClasses}>Team members who&apos;ll use ARLO</label>
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="e.g. 12"
                  value={formData.teamSize}
                  onChange={(e) => updateField("teamSize", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="font-sans font-medium text-fluid-h4 text-dark mb-2">Your needs</h3>
            <p className="font-sans text-fluid-main text-dark opacity-40 mb-6">
              Tell us what you run today and what&apos;s non-negotiable for Enterprise.
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Current data tooling</label>
                <textarea
                  className={`${inputClasses} resize-none`}
                  rows={3}
                  placeholder="e.g. Windsor.ai piping to BigQuery, Looker Studio dashboards, 6 analyst hours/week, internal reporting app"
                  value={formData.currentTools}
                  onChange={(e) => updateField("currentTools", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClasses}>Enterprise features you need</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {enterpriseFeatureOptions.map((feature) => {
                    const active = formData.neededFeatures.includes(feature);
                    return (
                      <button
                        type="button"
                        key={feature}
                        onClick={() => toggleFeature(feature)}
                        className={clsx(
                          "text-left px-3 py-2 rounded-md border font-sans text-sm transition-all",
                          active
                            ? "border-brand bg-brand/10 text-dark"
                            : "border-dark-faded text-dark/70 hover:border-dark/40"
                        )}
                      >
                        <span className="mr-2">{active ? "✓" : "○"}</span>
                        {feature}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={labelClasses}>Timeline *</label>
                <select
                  className={selectClasses}
                  value={formData.timeline}
                  onChange={(e) => updateField("timeline", e.target.value)}
                >
                  <option value="">Select...</option>
                  {timelines.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.timeline && <p className={errorClasses}>{errors.timeline}</p>}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="font-sans font-medium text-fluid-h4 text-dark mb-2">Budget + wrap up</h3>
            <p className="font-sans text-fluid-main text-dark opacity-40 mb-6">
              One last round so we can send a concrete number instead of a range.
            </p>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Monthly budget range *</label>
                <select
                  className={selectClasses}
                  value={formData.monthlyBudget}
                  onChange={(e) => updateField("monthlyBudget", e.target.value)}
                >
                  <option value="">Select...</option>
                  {monthlyBudgets.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {errors.monthlyBudget && <p className={errorClasses}>{errors.monthlyBudget}</p>}
              </div>
              <div>
                <label className={labelClasses}>How did you find us?</label>
                <select
                  className={selectClasses}
                  value={formData.referral}
                  onChange={(e) => updateField("referral", e.target.value)}
                >
                  <option value="">Select...</option>
                  {referralSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Anything else?</label>
                <textarea
                  className={`${inputClasses} resize-none`}
                  rows={3}
                  placeholder="Compliance requirements, preferred regions, integration quirks…"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </div>
              {errors.submit && <p className="text-bg-red text-sm mt-4 font-sans">{errors.submit}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  function renderSlide() {
    return mode === "enterprise" ? renderEnterpriseSlide() : renderGeneralSlide();
  }

  const firstName = formData.name.split(" ")[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[85vh] bg-light rounded-lg border border-dark-faded overflow-hidden flex flex-col"
      >
        <input
          type="text"
          name="_gotcha"
          value={formData._gotcha}
          onChange={(e) => updateField("_gotcha", e.target.value)}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-green/30 flex items-center justify-center mb-6">
              <Check size={32} className="text-bg-green" />
            </div>
            <h2 className="font-sans font-medium text-fluid-h3 text-dark mb-3">
              Hey{firstName ? `, ${firstName}` : ""}! Got it.
            </h2>
            <p className="font-sans text-fluid-main text-dark opacity-60 mb-2 max-w-md">
              {mode === "enterprise"
                ? "We'll review your details and come back with a custom quote within 1 business day."
                : "We'll reply to your question within 1 business day."}
            </p>
            <button onClick={handleClose} className="btn mt-8">
              <span className="text-sm">Close</span>
              <span className="btn-arrow">
                <X size={14} />
              </span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 md:px-8 pt-6 pb-4">
              <ProgressIndicator current={currentSlide} total={totalSlides} />
              <button
                onClick={handleClose}
                aria-label="Close"
                className="p-1 text-dark opacity-40 hover:opacity-100 transition-opacity"
                style={{ transitionDuration: "0.2s" }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-4">
              <div ref={slideRef}>{renderSlide()}</div>
            </div>
            <div className="px-6 md:px-8 py-5 border-t border-dark-faded flex justify-between items-center">
              {currentSlide > 0 ? (
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 font-sans text-fluid-main text-dark opacity-50 hover:opacity-100 transition-opacity"
                  style={{ transitionDuration: "0.2s" }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div />
              )}
              {currentSlide < totalSlides - 1 ? (
                <button onClick={goNext} className="btn-secondary flex items-center gap-2">
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="btn-secondary flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : mode === "enterprise" ? "Send inquiry" : "Send question"}
                  {!isSubmitting && <ArrowRight size={16} />}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Exported for backwards-compat with anyone importing `ContactFormMode` from here
export type { ContactFormMode };
