import { motion } from "framer-motion";
import { fadeInUp, featuresList, staggerContainer } from "./helper";

export const Features = () => {
  return (
    <section id='features' className='py-32 bg-secondary/20'>
      <div className='container mx-auto px-6'>
        <div className='text-center max-w-3xl mx-auto mb-20'>
          <motion.h2
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeInUp}
            className='text-3xl md:text-5xl font-bold mb-6'
          >
            Powerful & Extensible
          </motion.h2>
          <motion.p
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeInUp}
            className='text-lg text-muted-foreground'
          >
            Built for developers and power users who need control over their
            data.
          </motion.p>
        </div>

        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={staggerContainer}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
        >
          {featuresList.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -5 }} // Micro-interaction: Lift up
              className='group p-8 rounded-2xl bg-background border hover:border-primary/50 transition-all duration-300 hover:shadow-xl'
            >
              <div className='w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3'>
                <feature.icon className='h-7 w-7' />
              </div>
              <h3 className='font-bold text-xl mb-3 group-hover:text-primary transition-colors'>
                {feature.title}
              </h3>
              <p className='text-muted-foreground leading-relaxed'>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
