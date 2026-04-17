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
