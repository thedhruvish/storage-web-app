"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { OtpVerfiyForm } from "./components/otp-form";

export default function InputOTPPage() {
  return (
    <main className='flex min-h-svh items-center justify-center bg-gradient-to-br p-6'>
      <div className='animate-scale-in w-full max-w-sm'>
        <div className='mb-8 flex items-center justify-center gap-2'>
          <div className='flex size-10 items-center justify-center rounded-xl shadow-md'>
            <GalleryVerticalEnd className='size-5' />
          </div>
          <span className='text-xl font-bold'>Dhruvish Inc.</span>
        </div>

        <OtpVerfiyForm />
      </div>
    </main>
  );
}
