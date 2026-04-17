export interface ServicePillar {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  replaces: string[];
  heroH1: string;
  heroSubhead: string;
  problemHeading: string;
  problemSubhead: string;
  painPoints: { title: string; description: string }[];
  benefits: { title: string; description: string }[];
  processSteps: ProcessStep[];
  faqs: FAQItem[];
  bestFitCompanies: string[];
  metaTitle: string;
  metaDescription: string;
  tier: 1 | 2;
}

export interface CaseStudy {
  slug: string;
  client: string;
  industry: string;
  logo?: string;
  image?: string;
  color: string;
  saasReplaced: string;
  headline: string;
  summary: string;
  challenge: string;
  solution: string;
  techStack: string[];
  metrics: {
    label: string;
    value: string;
    description?: string;
  }[];
  testimonial?: {
    quote: string;
    name: string;
    title: string;
  };
  metaTitle: string;
  metaDescription: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "pricing" | "process" | "technical" | "ownership";
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  color: string;
  featured?: boolean;
}

export interface PricingTier {
  name: string;
  priceRange: string;
  description: string;
  includes: string[];
  color: string;
  featured?: boolean;
  retainer?: boolean;
}

export interface ComparisonRow {
  feature: string;
  custom: string | boolean;
  saas: string | boolean;
}

export interface IndustryVertical {
  slug: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  relevantPillars: string[];
}
