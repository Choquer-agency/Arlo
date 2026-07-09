/* eslint-disable @typescript-eslint/no-explicit-any */
/** Per-page content for the Pricing page. */
const pricing: Record<string, any> = {
  cta: {
    eyebrow: "Get started",
    heading: "Free today. No card, no lock-in.",
    buttonText: "Start For Free",
    buttonHref: "/welcome",
  },

  faq: {
    eyebrow: "FAQ",
    heading: "Questions about free",
    subtext: "The honest answers on why ARLO costs nothing right now.",
    contactPre: "Still wondering something? Talk to our",
    contactHref: "/contact",
    contactLink: "team",
    items: [
      {
        q: "Is ARLO really free right now?",
        a: "Yes — completely. Every feature, every client, every destination, for $0 and no credit card. We're in early access and we'd rather have agencies using ARLO than evaluating a price sheet.",
      },
      {
        q: "Will ARLO always be free?",
        a: "No — we'll introduce pricing down the road, and we'll be upfront about it. When that happens you'll pick a plan that fits or walk away. Nothing gets auto-charged: there's no card on file, so we can't quietly start billing you.",
      },
      {
        q: "Do I need a credit card to start?",
        a: "No. There's nothing to enter and nothing to cancel. Sign up with your agency email, connect your first client, and start asking Claude.",
      },
      {
        q: "Is there a catch or a usage limit?",
        a: "No hidden limits during early access. Connect as many clients as you manage and ask as many questions as you want. All we ask in return is your feedback while we build.",
      },
      {
        q: "Why give it away for free?",
        a: "Because we're early, and the best way to build the right product — and the right pricing — is to get it into agencies' hands first. Free now buys us honest feedback, and it lets you prove ARLO out with zero risk before we ever talk price.",
      },
    ],
  },
};
export default pricing;
