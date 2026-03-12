import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { fadeInUp, staggerContainer } from "./helper";

export const Hero = () => {
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
            className='inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold cursor-default hover:bg-primary/20 transition-colors'
          >
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
            </span>
            Own Storage
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
            className='flex flex-col sm:flex-row gap-4 justify-center items-center'
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to='/auth/signup'
                className='flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl hover:shadow-primary/25'
              >
                Upload
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={"/pricing"}
                className='flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-secondary/80 transition-all border border-border'
              >
                <LogIn className='h-5 w-5' /> View Pricing
              </Link>
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
