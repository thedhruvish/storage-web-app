import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { GlobalPriceHashModal } from "@/components/global-price-hash-modal";
import Error404 from "@/components/status-code/404";
import Error500 from "@/components/status-code/500";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <GlobalPriceHashModal />
      {import.meta.env.MODE === "development" && (
        <>
          <ReactQueryDevtools buttonPosition='bottom-left' />
          <TanStackRouterDevtools position='bottom-right' />
        </>
      )}
    </>
  ),
  notFoundComponent: () => <Error404 />,
  errorComponent: () => <Error500 />,
});
