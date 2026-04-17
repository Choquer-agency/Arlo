import { ClientLayout } from "@/components/ClientLayout";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { TrustBar } from "@/components/TrustBar";
import { SaaSPain } from "@/components/SaaSPain";
import { ServicePillars } from "@/components/ServicePillars";
import { FeaturedCaseStudy } from "@/components/FeaturedCaseStudy";
import { Process } from "@/components/Process";
import { Testimonials } from "@/components/Testimonials";

import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { PixelReveal } from "@/components/PixelReveal";
import HeroGridAnimation from "@/components/HeroGridAnimation";
import { ConnectSection } from "@/components/ConnectSection";
import { DestinationsTeaser } from "@/components/DestinationsTeaser";

export default function Home() {
  return (
    <ClientLayout>
      <HeroGridAnimation>
        <Nav />
        <PixelReveal immediate duration={0.7} intensity={6}>
          <Hero />
        </PixelReveal>
      </HeroGridAnimation>
      <PixelReveal>
        <TrustBar />
      </PixelReveal>
      <PixelReveal intensity={4}>
        <SaaSPain />
      </PixelReveal>
      <PixelReveal intensity={4}>
        <ServicePillars />
      </PixelReveal>
      <PixelReveal intensity={4}>
        <DestinationsTeaser />
      </PixelReveal>
      <ConnectSection />
      <PixelReveal>
        <FeaturedCaseStudy />
      </PixelReveal>
      <PixelReveal intensity={4}>
        <Process />
      </PixelReveal>
      <PixelReveal>
        <Testimonials />
      </PixelReveal>
      <PixelReveal intensity={4}>
        <Pricing />
      </PixelReveal>
      <PixelReveal>
        <FAQ />
      </PixelReveal>
      <Footer />
    </ClientLayout>
  );
}
