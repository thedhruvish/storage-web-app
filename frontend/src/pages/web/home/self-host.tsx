import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { fadeInUp } from "./helper";

export const SelfHostSection = () => {
  return (
    <section id='self-host' className='py-24 bg-background'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-bold mb-4 text-muted-foreground'>
              <Github className='h-3 w-3' /> OPEN SOURCE
            </div>
            <h2 className='text-3xl md:text-5xl font-bold mb-6'>
              Host Your Own S3 Compatible Server
            </h2>
            <p className='text-lg text-muted-foreground mb-8 leading-relaxed'>
              Don't trust your data to big tech? Deploy your own secure storage
              infrastructure. Our backend is 100% open-source and compatible
              with AWS S3 APIs. Run it on a VPS, Raspberry Pi, or your local
              network.
            </p>
            <div className='flex flex-col sm:flex-row gap-4'>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href='https://github.com/thedhruvish/storage-web-app'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-primary/25'
              >
                <Github className='h-5 w-5' /> Star on GitHub
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href='https://github.com/thedhruvish/storage-web-app#installation'
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-all border border-border'
              >
                Read Docs <ArrowRight className='h-4 w-4' />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={fadeInUp}
            className='bg-muted/50 rounded-2xl p-6 border font-mono text-sm shadow-2xl overflow-hidden relative'
          >
            <div className='flex gap-2 mb-4 border-b border-border pb-2'>
              <div className='w-3 h-3 rounded-full bg-red-500' />
              <div className='w-3 h-3 rounded-full bg-yellow-500' />
              <div className='w-3 h-3 rounded-full bg-green-500' />
            </div>
            <p className='text-muted-foreground'># Clone the repository</p>
            <p className='mb-4 text-blue-500'>
              git clone https://github.com/thedhruvish/storage-web-app.git
            </p>

            <p className='text-muted-foreground'># Install dependencies</p>
            <p className='mb-4 text-blue-500'>npm install</p>

            <p className='text-muted-foreground'># Start the S3 Server</p>
            <div className='flex items-center gap-2'>
              <span className='text-blue-500'>npm run start:server</span>
              <span className='animate-pulse text-green-500'>● Running</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
