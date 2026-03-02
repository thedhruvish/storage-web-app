import { useEffect, useState } from "react";
import { PricingView } from "@/pages/web/pricing/pricing-view";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const PRICE_HASH = "#price";

function hasPriceHash() {
  return window.location.hash.toLowerCase() === PRICE_HASH;
}

export function GlobalPriceHashModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const syncFromHash = () => {
      setOpen(hasPriceHash());
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  const clearHash = () => {
    if (!hasPriceHash()) {
      setOpen(false);
      return;
    }

    const nextUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", nextUrl);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && clearHash()}>
      <DialogContent
        className='inset-0! top-0! left-0! z-60 h-dvh! w-screen! max-w-none! translate-x-0! translate-y-0! overflow-hidden rounded-none border-0 p-0'
        showCloseButton
      >
        <DialogTitle className='sr-only'>Pricing</DialogTitle>
        <div className='h-full overflow-y-auto'>
          <PricingView mode='modal' />
        </div>
      </DialogContent>
    </Dialog>
  );
}
