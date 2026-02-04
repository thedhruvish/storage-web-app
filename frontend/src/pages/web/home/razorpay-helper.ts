import { APP_NAME } from "@/contansts";
import { useAppearanceStore } from "@/store/appearance-store";
import { useUserStore } from "@/store/user-store";

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const razorpayOption = (
  subscription_id: string,
  description: string,
  onClose?: () => void,
  onSuccess?: (response: any) => void
) => {
  const user = useUserStore.getState().user;
  const appearance =
    useAppearanceStore.getState().appearance.theme === "dark"
      ? "#000000"
      : "#fffff";

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    currency: "INR",
    name: APP_NAME,
    description,
    subscription_id,
    prefill: {
      name: user?.name,
      email: user?.email,
    },
    handler: async function (response: any) {
      onSuccess?.(response);
    },
    modal: {
      ondismiss: function () {
        console.log("Razorpay modal closed by user");
        onClose?.();
      },
    },
    theme: {
      color: appearance,
    },
    notes: {
      userId: user?._id,
      planId: subscription_id,
    },
  };
  return options;
};
