import { Smartphone, Download } from "lucide-react";

export function MobileAppSection() {
  return (
    <section className='py-24 bg-background overflow-hidden'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-col lg:flex-row items-center gap-16'>
          {/* Text Content */}
          <div className='flex-1 space-y-8 text-center lg:text-left'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-left-4 duration-500'>
              <Smartphone className='size-3.5' />
              <span>Coming Soon</span>
            </div>

            <div className='space-y-4'>
              <h2 className='text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]'>
                Your files, <br />
                <span className='text-primary'>Always in your pocket.</span>
              </h2>
              <p className='text-muted-foreground text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed'>
                Sync web and app automatically. We are building a powerful
                mobile experience that brings all your secure storage features
                to your fingertips.
              </p>
            </div>

            <div className='grid gap-4 max-w-md mx-auto lg:mx-0 pt-4'>
              <div className='flex items-start gap-3 p-4 rounded-2xl border border-border bg-card/50 shadow-sm transition-all hover:border-primary/20'>
                <div className='h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0'>
                  <Download className='size-5' />
                </div>
                <div>
                  <h4 className='font-semibold text-sm'>
                    Sync mobile app and web app
                  </h4>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Keep your files updated across all your devices in
                    real-time.
                  </p>
                </div>
              </div>
            </div>

            <div className='flex flex-wrap justify-center lg:justify-start gap-4 pt-4 opacity-50 grayscale select-none'>
              <div className='h-10 w-32 bg-foreground rounded-lg flex items-center justify-center text-background gap-2 border border-foreground'>
                <div className='size-5 bg-white rounded-full flex items-center justify-center'>
                  <div className='size-3 bg-black rounded-full' />
                </div>
                <div className='flex flex-col leading-none'>
                  <span className='text-[8px] uppercase font-bold'>
                    Soon on
                  </span>
                  <span className='text-xs font-bold'>Google Play</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image/Mockup Content */}
          <div className='flex-1 relative'>
            <div className='absolute -inset-4 bg-primary/5 rounded-full blur-3xl opacity-50' />
            <div className='relative animate-in zoom-in-95 duration-1000'>
              <div className='max-w-[400px] mx-auto relative group'>
                {/* Minimalist Phone Frame Effect */}
                <div className='absolute -inset-1 bg-gradient-to-tr from-primary/20 to-transparent rounded-[3rem] blur-sm group-hover:opacity-75 transition-opacity' />
                <img
                  src='/mobile-1.webp'
                  alt='StoreOne Mobile App'
                  className='relative rounded-[2.5rem] shadow-2xl border-[8px] border-card z-10 w-full'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
