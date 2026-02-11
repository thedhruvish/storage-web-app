import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Features } from "@/pages/web/home/features";
import { Hero } from "@/pages/web/home/here";
import { Integrations } from "@/pages/web/home/integration";
import { SelfHostSection } from "@/pages/web/home/self-host";
import { Testimonials } from "@/pages/web/home/testimonials";
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
      <Uploading />
      <Integrations />
      <SelfHostSection />
      <Testimonials />
    </main>
  );
}
