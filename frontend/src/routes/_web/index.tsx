import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Features } from "@/pages/web/home/features";
import { Hero } from "@/pages/web/home/here";
import { MobileAppSection } from "@/pages/web/home/mobile-app";
import { SelfHostSection } from "@/pages/web/home/self-host";
import { StartFreeTrial } from "@/pages/web/home/start-free-trial";
import { Uploading } from "@/pages/web/home/uploading";

export const Route = createFileRoute("/_web/")({
  component: LandingPage,
});

function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main>
      <Hero />
      <Features />
      <MobileAppSection />
      <Uploading />
      {/* <Integrations /> */}
      <SelfHostSection />
      {/* <Testimonials /> */}
      <StartFreeTrial />
    </main>
  );
}
