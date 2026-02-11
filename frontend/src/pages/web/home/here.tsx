import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cloud, HardDrive, LogIn } from "lucide-react";
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
            Your Storage, <br />
            <span className='text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-600'>
              Simplified Forever.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed'
          >
            The open-source storage solution that integrates with Google Drive.
            Clean, organize, and secure your digital life with zero vendor
            lock-in.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className='flex flex-col sm:flex-row gap-4 justify-center items-center'
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to='/pricing'
                className='flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl hover:shadow-primary/25'
              >
                View Pricing
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className='flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-secondary/80 transition-all border border-border'>
                <LogIn className='h-5 w-5' /> View Demo
              </button>
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
          <div className='relative rounded-2xl border border-border bg-card/50 backdrop-blur shadow-2xl overflow-hidden aspect-16/10 max-w-5xl'>
            <div className='absolute inset-0 bg-grid-pattern opacity-5' />
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center p-10'>
                <div className='flex gap-4 justify-center mb-8'>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeInOut",
                    }}
                    className='bg-background border p-4 rounded-xl shadow-lg'
                  >
                    <HardDrive className='h-8 w-8 text-primary' />
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      delay: 0.2,
                      ease: "easeInOut",
                    }}
                    className='bg-background border p-4 rounded-xl shadow-lg border-primary ring-2 ring-primary/20'
                  >
                    <Cloud className='h-8 w-8 text-primary' />
                  </motion.div>
                </div>
                <h3 className='text-2xl font-bold mb-2'>
                  All sources connected
                </h3>
                <p className='text-muted-foreground'>
                  Google Drive, AWS S3, and Local Storage unified.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
