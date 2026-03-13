import { Link } from "@tanstack/react-router";
import { APP_NAME, GITHUB_REPO_LINK } from "@/contansts";
import { Cloud } from "lucide-react";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className='border-t bg-muted/30 py-20'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-10'>
          {/* Brand */}
          <div className='md:col-span-1'>
            <div className='flex items-center gap-2 font-bold text-xl mb-4'>
              <Cloud className='text-primary h-6 w-6' />
              <span>{APP_NAME}</span>
            </div>
            <p className='text-sm text-muted-foreground max-w-xs'>
              Open-source, bring-your-own-storage platform. Store files in your
              own cloud and stay in full control.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className='text-sm font-semibold mb-4'>Product</h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <a
                  href='/pricing'
                  className='hover:text-primary transition-colors'
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href='/docs'
                  className='hover:text-primary transition-colors'
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href='/self-host'
                  className='hover:text-primary transition-colors'
                >
                  Self-Hosting
                </a>
              </li>
            </ul>
          </div>

          {/* Content */}
          <div>
            <h4 className='text-sm font-semibold mb-4'>Content</h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <a
                  href={GITHUB_REPO_LINK}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-primary transition-colors'
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href='https://x.com/dhruvishLathiya'
                  target='_blank'
                  className='hover:text-primary transition-colors'
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href='https://www.linkedin.com/in/dhruvishlathiya'
                  target='_blank'
                  className='hover:text-primary transition-colors'
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className='text-sm font-semibold mb-4'>Legal</h4>
            <ul className='space-y-2 text-sm text-muted-foreground'>
              <li>
                <Link
                  to='/privacy-policy'
                  className='hover:text-primary transition-colors'
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to='/terms-and-conditions'
                  className='hover:text-primary transition-colors'
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to='/refund-policy'
                  className='hover:text-primary transition-colors'
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='mt-16 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground'>
          <span>
            © {year} {APP_NAME}.
          </span>
          <span>
            Built by{" "}
            <a
              href={`https://dhruvish.in?utm_source=${APP_NAME}`}
              target='_blank'
              className='font-medium text-foreground'
            >
              Dhruvish Lathiya
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};
