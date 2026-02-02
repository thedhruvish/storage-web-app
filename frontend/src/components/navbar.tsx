import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cloud, Moon, Sun, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed top-0 w-full z-50 border-b transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm"
          : "bg-background/50 backdrop-blur-sm border-transparent"
      )}
    >
      <div className='container mx-auto px-6 h-20 flex items-center justify-between'>
        <Link
          to='/'
          className='flex items-center gap-3 font-bold text-2xl tracking-tight group'
        >
          <div className='bg-primary text-primary-foreground p-2 rounded-lg transition-transform group-hover:rotate-12 duration-300'>
            <Cloud className='h-6 w-6' />
          </div>
          <span>StoreFlow</span>
        </Link>

        <div className='hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground'>
          <Link
            to='#features'
            className='hover:text-foreground hover:scale-105 transition-all duration-200'
          >
            Features
          </Link>
          <Link
            to='#integrations'
            className='hover:text-foreground hover:scale-105 transition-all duration-200'
          >
            Integrations
          </Link>
          <Link
            to='#self-host'
            className='hover:text-foreground hover:scale-105 transition-all duration-200'
          >
            Self Host
          </Link>
        </div>

        <div className='flex items-center gap-4'>
          {/* Fixed Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className='relative h-9 w-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring'
            aria-label='Toggle Theme'
          >
            <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute' />
            <Moon className='h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute' />
          </button>

          <Link
            to='/auth/login'
            className='hidden md:block text-sm font-medium hover:text-primary transition-colors hover:underline underline-offset-4'
          >
            Log in
          </Link>
          <Link
            to='/auth/signup'
            className='flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-95'
          >
            <UserPlus className='h-4 w-4' /> Register
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};
