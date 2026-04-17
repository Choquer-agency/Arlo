"use client";

import { useState, useRef } from "react";
import { submitForm } from "@/lib/form";
import { AGENCY_NAME } from "@/lib/siteConfig";
import { Check } from "lucide-react";

const projectTypes = [
  "Replace a SaaS tool with custom software",
  "Build a custom CRM",
  "Build a custom ERP",
  "AI agent or automation platform",
  "Business intelligence / analytics",
  "Legacy system modernization",
  "Other",
];

export function ContactPageForm() {
  const mountTime = useRef(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    message: "",
    _gotcha: "",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData._gotcha || Date.now() - mountTime.current < 3000) return;

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.company.trim()) newErrors.company = "Company is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitForm({
        ...formData,
        websiteSource: AGENCY_NAME,
        formType: "contact-page",
        submittedAt: new Date().toISOString(),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      });
      setIsSuccess(true);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClasses =
    "w-full px-4 py-3 rounded-md border border-dark-faded bg-light text-dark placeholder:text-dark/30 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-fluid-main font-sans";
  const labelClasses = "block text-sm font-sans font-medium text-dark mb-1.5";
  const errorClasses = "text-bg-red text-xs mt-1 font-sans";

  if (isSuccess) {
    return (
      <div className="p-8 rounded-xl border border-dark-faded bg-light text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-bg-green/30 flex items-center justify-center mb-6">
          <Check size={32} className="text-bg-green" />
        </div>
        <h3 className="font-sans font-medium text-fluid-h4 text-dark mb-3">
          Thank you!
        </h3>
        <p className="font-sans text-fluid-main text-dark opacity-60">
          We&apos;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 rounded-xl border border-dark-faded bg-light"
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

      <h2 className="font-sans font-medium text-fluid-h4 text-dark mb-6">
        Send us a message
      </h2>

      <div className="space-y-4">
        <div>
          <label className={labelClasses}>Full Name *</label>
          <input
            type="text"
            className={inputClasses}
            placeholder="John Smith"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
          {errors.name && <p className={errorClasses}>{errors.name}</p>}
        </div>
        <div>
          <label className={labelClasses}>Email Address *</label>
          <input
            type="email"
            className={inputClasses}
            placeholder="john@company.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
          {errors.email && <p className={errorClasses}>{errors.email}</p>}
        </div>
        <div>
          <label className={labelClasses}>Company Name *</label>
          <input
            type="text"
            className={inputClasses}
            placeholder="Acme Inc."
            value={formData.company}
            onChange={(e) => updateField("company", e.target.value)}
          />
          {errors.company && <p className={errorClasses}>{errors.company}</p>}
        </div>
        <div>
          <label className={labelClasses}>What are you looking for?</label>
          <select
            className={`${inputClasses} appearance-none`}
            value={formData.projectType}
            onChange={(e) => updateField("projectType", e.target.value)}
          >
            <option value="">Select...</option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClasses}>Message</label>
          <textarea
            className={`${inputClasses} resize-none`}
            rows={4}
            placeholder="Tell us about your project, current SaaS tools, or any specific needs..."
            value={formData.message}
            onChange={(e) => updateField("message", e.target.value)}
          />
        </div>
        {errors.submit && (
          <p className="text-bg-red text-sm font-sans">{errors.submit}</p>
        )}
        <button
          type="submit"
          className="btn-secondary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
