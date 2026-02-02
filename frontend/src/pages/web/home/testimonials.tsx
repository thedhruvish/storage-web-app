import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { fadeInUp } from "./helper";

export const Testimonials = () => {
  return (
    <section className='py-20 bg-secondary/30'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={fadeInUp}
          className='max-w-4xl mx-auto text-center mb-12'
        >
          <h2 className='text-3xl font-bold mb-4'>Loved by Users</h2>
          <div className='flex justify-center gap-1 text-yellow-500 mb-4'>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className='fill-current w-5 h-5' />
            ))}
          </div>
          <p className='text-xl italic text-muted-foreground'>
            "I was constantly getting 'Storage Full' notifications. StoreFlow
            cleared 12GB in 5 minutes. It feels like I have a new phone!"
          </p>
        </motion.div>

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={fadeInUp}
          className='flex justify-center items-center gap-4'
        >
          <div className='flex -space-x-4'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='w-12 h-12 rounded-full bg-gray-300 border-2 border-background'
              />
            ))}
          </div>
          <p className='font-medium'>Join 500,000+ Happy Users</p>
        </motion.div>
      </div>
    </section>
  );
};
