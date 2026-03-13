import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import LiquidButton from "@/components/ui/liquid-button";
import { useTheme } from "@/components/theme-provider";

export const StartFreeTrial = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <section className='py-24 relative overflow-hidden'>
      <div className='container mx-auto px-6 '>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className='relative rounded-3xl border border-border bg-card/60 backdrop-blur shadow-2xl p-10 text-center'
        >
          {/* Glow */}
          <div className='absolute inset-0 rounded-3xl bg-linear-to-r from-primary/10 to-blue-500/10 blur-2xl' />

          <div className='relative z-10'>
            <h2 className='text-3xl md:text-5xl font-extrabold mb-4'>
              Let’s Start Your Free Trial
            </h2>

            <p className='text-lg text-muted-foreground mb-8 max-w-xl mx-auto'>
              Get started in minutes. Connect your own storage, upload files,
              and stay in control — no credit card required.
            </p>

            <div className='flex justify-center'>
              <LiquidButton
                onClick={() => navigate({ to: "/auth/signup" })}
                direction='ink'
                className='px-10 py-4 rounded-xl text-lg'
                initialBgColor={theme === "dark" ? "bg-white" : "bg-black"}
                text={
                  theme === "dark"
                    ? "text-black group-hover:text-white"
                    : "text-white group-hover:text-black"
                }
                fill={theme === "dark" ? "bg-black" : "bg-white"}
              >
                Start Free Trial <ArrowRight className='ml-2 h-5 w-5' />
              </LiquidButton>
            </div>

            <p className='mt-4 text-sm text-muted-foreground'>
              No credit card required · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
