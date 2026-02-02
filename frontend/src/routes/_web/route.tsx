import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_web")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className='min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 antialiased'>
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </>
  );
}
