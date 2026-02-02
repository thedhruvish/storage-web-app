import { motion } from "framer-motion";
import { Cloud } from "lucide-react";

export const Integrations = () => {
  return (
    <section id='integrations' className='py-32'>
      <div className='container mx-auto px-6 text-center'>
        <h2 className='text-3xl font-bold mb-12'>
          Works with your favorite tools
        </h2>
        <div className='flex justify-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500'>
          {/* ONLY Google Drive added as requested */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className='flex items-center gap-3 text-2xl font-bold border p-6 rounded-2xl bg-card shadow-sm hover:shadow-md transition-all cursor-default'
          >
            <Cloud className='h-8 w-8' /> Google Drive
          </motion.div>
        </div>
      </div>
    </section>
  );
};
