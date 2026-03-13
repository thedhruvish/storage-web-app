import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import LiquidButton from "@/components/ui/liquid-button";
import PillAlert from "@/components/ui/pill-alert";
import SplashButton from "@/components/ui/splash-button";
import { useTheme } from "@/components/theme-provider";
import { VideoPlayer } from "@/components/video-player";
import { fadeInUp, staggerContainer } from "./helper";

export const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <section className='pt-40 pb-32 overflow-hidden relative'>
      <div className='container mx-auto px-6 text-center relative z-10 max-w-5xl'>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className='items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-primary text-sm font-semibold '
          >
            <PillAlert
              shortText='Free Try'
              badgeText='500 MB STORAGE'
              longText='Your Own Storage, Smarter and Faster.'
            />
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className='text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]'
          >
            Own Your Storage, <br />
            <span className='text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600'>
              Not Your Vendor.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed'
          >
            An open-source, bring-your-own-storage platform that connects Google
            Drive and S3-compatible clouds. Store files in your own accounts,
            stay in control, and avoid vendor lock-in forever.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className='flex flex-col sm:flex-row gap-6 justify-center items-center'
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LiquidButton
                direction={"dual"}
                onClick={() => navigate({ to: "/auth/signup" })}
                className='text-lg px-10 py-4'
                // Using Tailwind classes for dynamic hover text color transition
                initialBgColor={theme === "dark" ? "bg-white" : "bg-black"}
                text={
                  theme === "dark"
                    ? "text-black group-hover:text-white"
                    : "text-white group-hover:text-black"
                }
                fill={theme === "dark" ? "bg-black" : "bg-white"}
              >
                Upload
              </LiquidButton>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <SplashButton
                onClick={() => navigate({ to: "/pricing" })}
                status={theme === "dark" ? "neutral" : "info"}
                className='text-lg px-10 py-4 normal-case font-semibold tracking-normal flex '
              >
                <div className='flex  gap-2 items-center justify-center'>
                  <LogIn className='h-5 w-5' /> View Pricing
                </div>
              </SplashButton>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className='mt-20 relative mx-auto'
        >
          <VideoPlayer />
        </motion.div>
      </div>
    </section>
  );
};
