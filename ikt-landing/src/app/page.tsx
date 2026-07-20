import { ParticleBackground } from "@/components/ParticleBackground";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { ArchitectureSection } from "@/components/sections/ArchitectureSection";
import { DashboardSection } from "@/components/sections/DashboardSection";
import { UniqueSection } from "@/components/sections/UniqueSection";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#040b1a] text-white overflow-x-hidden">
      {/* Animated particle background */}
      <ParticleBackground />

      {/* Navigation */}
      <Navbar />

      {/* Page sections */}
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ArchitectureSection />
      <DashboardSection />
      <UniqueSection />
      <ImpactSection />
      <CTASection />
      <Footer />
    </main>
  );
}
