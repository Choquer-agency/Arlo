import localFont from "next/font/local";

export const neueMontreal = localFont({
  src: [
    {
      path: "../../public/fonts/PPNeueMontreal-Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PPNeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/PPNeueMontreal-Italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});

// Libre Caslon Text — serif display face for headings (matches the ARLO reskin).
// v3 TTFs are the provenance-verified files (correct italic flag).
export const libreCaslon = localFont({
  src: [
    { path: "../../public/fonts/LibreCaslonText-Regular-v3.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/LibreCaslonText-Italic-v3.ttf", weight: "400", style: "italic" },
    { path: "../../public/fonts/LibreCaslonText-Bold-v3.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-caslon",
  display: "swap",
});

export const neueBit = localFont({
  src: [
    {
      path: "../../public/fonts/PPNeueBit-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-neue-bit",
  display: "swap",
});

export const ibmPlexMono = localFont({
  src: [
    {
      path: "../../public/fonts/IBMPlexMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/IBMPlexMono-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-ibm-mono",
  display: "swap",
});
