import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Upload,
  Check,
  FileImage,
  ArrowUp,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Uploading = () => {
  const [phase, setPhase] = useState<
    "idle" | "encrypting" | "uploading" | "success"
  >("idle");
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);

  const startDemo = () => {
    setPhase("encrypting");
    setProgress(0);

    // Simulate Encryption Phase
    setTimeout(() => {
      setPhase("uploading");
      let currentProgress = 0;

      const interval = setInterval(() => {
        // Random speed fluctuation
        setSpeed(Number((Math.random() * 15 + 5).toFixed(1)));

        currentProgress += Math.random() * 2; // Random increments

        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setSpeed(0);
          setPhase("success");
          setTimeout(() => setPhase("idle"), 3000);
        }
        setProgress(currentProgress);
      }, 50);
    }, 1500); // 1.5s encryption delay
  };

  return (
    <section className='py-20 bg-muted/20 overflow-hidden'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-16 items-center'>
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 uppercase tracking-wider'>
              <Wifi className='h-3 w-3' /> Edge Computing
            </div>
            <h2 className='text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/60'>
              Lightning Fast Uploads
            </h2>
            <p className='text-lg text-muted-foreground mb-8 leading-relaxed'>
              Experience our optimized pipeline. Files are encrypted locally
              before transmission, ensuring speed without compromising security.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startDemo}
              disabled={phase !== "idle"}
              className={cn(
                "group relative flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-xl transition-all",
                phase === "idle"
                  ? "hover:bg-primary/90 hover:shadow-primary/30"
                  : "cursor-not-allowed opacity-50"
              )}
            >
              <AnimatePresence mode='wait'>
                {phase === "idle" && (
                  <motion.div
                    key='btn-text'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className='flex items-center gap-2'
                  >
                    <Upload className='h-5 w-5 transition-transform group-hover:-translate-y-1' />
                    <span>Start Demo Upload</span>
                  </motion.div>
                )}
                {phase !== "idle" && (
                  <motion.div
                    key='btn-loading'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='flex items-center gap-2'
                  >
                    <motion.div className='h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin' />
                    <span>Processing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Animation Card */}
          <div className='flex justify-center'>
            <div className='relative w-full max-w-md'>
              {/* Background Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className='absolute inset-0 bg-primary/20 blur-3xl rounded-full'
              />

              {/* Main Card */}
              <div className='relative bg-background/50 backdrop-blur-xl border border-border rounded-3xl p-1 shadow-2xl overflow-hidden'>
                <div className='bg-card/80 rounded-[22px] p-8 border border-white/5'>
                  {/* Header: File Info */}
                  <div className='flex items-start justify-between mb-8'>
                    <div className='flex items-center gap-4'>
                      <div
                        className={cn(
                          "relative p-3 rounded-2xl transition-all duration-500",
                          phase === "success"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        <AnimatePresence mode='wait'>
                          <motion.div
                            key={phase}
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                          >
                            {phase === "success" ? (
                              <Check className='h-6 w-6' />
                            ) : phase === "encrypting" ? (
                              <Lock className='h-6 w-6' />
                            ) : phase === "uploading" ? (
                              <FileImage className='h-6 w-6' />
                            ) : (
                              <Upload className='h-6 w-6' />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      <div>
                        <h3 className='font-bold text-lg'>
                          Project_Assets.zip
                        </h3>
                        <p className='text-sm text-muted-foreground'>
                          24.5 MB • ZIP Archive
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className='px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-secondary-foreground'>
                      {phase === "idle" && "Ready"}
                      {phase === "encrypting" && (
                        <span className='text-yellow-600 flex items-center gap-1'>
                          <Lock className='h-3 w-3' /> Encrypting
                        </span>
                      )}
                      {phase === "uploading" && (
                        <span className='text-blue-600 flex items-center gap-1'>
                          <Wifi className='h-3 w-3' /> Uploading
                        </span>
                      )}
                      {phase === "success" && (
                        <span className='text-green-600'>Done</span>
                      )}
                    </div>
                  </div>

                  {/* Central Visual Area */}
                  <div className='relative h-48 flex items-center justify-center mb-8 overflow-hidden rounded-xl bg-muted/30 border border-dashed border-border/50'>
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />

                    {/* Central File Icon Animation */}
                    <motion.div
                      animate={{
                        scale: phase === "uploading" ? [1, 0.9, 1] : 1,
                        opacity: phase === "encrypting" ? 0.7 : 1,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: phase === "uploading" ? Infinity : 0,
                      }}
                      className='relative z-10'
                    >
                      <FileImage className='h-16 w-16 text-primary/80' />
                    </motion.div>

                    {/* Beam Animation (Uploading Only) */}
                    <AnimatePresence>
                      {phase === "uploading" && (
                        <motion.div
                          initial={{ y: 80, opacity: 0 }}
                          animate={{ y: -60, opacity: [0, 1, 0] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className='absolute z-20'
                        >
                          <ArrowUp className='h-8 w-8 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]' />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Shield Overlay (Encrypting Only) */}
                    <AnimatePresence>
                      {phase === "encrypting" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1, rotate: 360 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.5 }}
                          className='absolute z-20 bg-yellow-500/20 p-4 rounded-full backdrop-blur-sm border border-yellow-500/30'
                        >
                          <ShieldCheck className='h-8 w-8 text-yellow-600' />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Progress Bar & Stats */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between text-sm font-medium'>
                      <span
                        className={cn(
                          "transition-colors",
                          phase === "success"
                            ? "text-green-600"
                            : "text-foreground"
                        )}
                      >
                        {Math.round(progress)}%
                      </span>
                      <span className='text-muted-foreground font-mono text-xs'>
                        {phase === "uploading"
                          ? `${speed} MB/s`
                          : phase === "encrypting"
                            ? "AES-256..."
                            : phase === "success"
                              ? "12.4 MB/s (Avg)"
                              : "Waiting..."}
                      </span>
                    </div>

                    <div className='h-2 w-full bg-secondary rounded-full overflow-hidden'>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{
                          type: "spring",
                          stiffness: 30,
                          damping: 20,
                        }}
                        className={cn(
                          "h-full rounded-full",
                          phase === "success" ? "bg-green-500" : "bg-primary"
                        )}
                      />
                    </div>

                    {/* Fake Console Log */}
                    <div className='h-6 overflow-hidden font-mono text-[10px] text-muted-foreground flex items-center gap-2'>
                      <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                      <AnimatePresence mode='wait'>
                        <motion.span
                          key={phase}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {phase === "idle" &&
                            "> System ready. Waiting for input."}
                          {phase === "encrypting" &&
                            "> Generating keys... Locking local files."}
                          {phase === "uploading" &&
                            `> Uploading packet ${Math.floor(progress / 10)}... Connection stable.`}
                          {phase === "success" &&
                            "> Upload verified. File checksum: 8f9a2c..."}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
