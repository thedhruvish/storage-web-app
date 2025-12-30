import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import FailPasskey from "@/pages/profile/passkey-components/fail-passkey";
import ProccessPasskey from "@/pages/profile/passkey-components/proccess-passkey";
import SuccessPasskey from "@/pages/profile/passkey-components/success-passkey";
import { startAuthentication } from "@simplewebauthn/browser";
import { KeyRound, ShieldCheck, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import {
  useLoginWithPasskeyChallenge,
  useLoginWithPasskeyChallengeVerify,
} from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/auth/2fa/passkey")({
  component: PasskeyPage,
});

type PasskeyStep =
  | "initial"
  | "proccess-passkey"
  | "fail-passkey"
  | "success-passkey";

function PasskeyPage() {
  const [step, setStep] = useState<PasskeyStep>("initial");
  const navigate = useNavigate();

  const { mutateAsync: getChallenge } = useLoginWithPasskeyChallenge();
  const { mutateAsync: verifyPasskey } = useLoginWithPasskeyChallengeVerify();

  const handleStartVerification = async () => {
    setStep("proccess-passkey");
    const userId = localStorage.getItem("userId");

    if (!userId) {
      toast.error("User session not found");
      navigate({ to: "/auth/login" });
      return;
    }

    try {
      const response = await getChallenge({
        userId,
      });

      let asseResp;
      try {
        asseResp = await startAuthentication({
          optionsJSON: response.data.data,
        });
      } catch {
        setStep("fail-passkey");
        return;
      }
      // 3. Verify with Backend
      await verifyPasskey({
        response: asseResp,
        userId,
      });

      setStep("success-passkey");
      setTimeout(() => {
        navigate({ to: "/app" });
      }, 2000);
    } catch {
      setStep("fail-passkey");
    }
  };

  const handleDone = () => {
    navigate({ to: "/app" });
  };

  return (
    <Card className='relative w-full max-w-md mx-auto overflow-hidden'>
      {/* Header is only for initial view or we customize per step if needed, but components handle their own UI mostly */}

      {step === "initial" && (
        <>
          <CardHeader className='flex flex-col items-center gap-2 text-center pb-6'>
            <div className='bg-primary/10 text-primary mb-2 flex size-12 items-center justify-center rounded-full'>
              <ShieldCheck className='size-6' />
            </div>
            <CardTitle className='text-xl'>Login with Passkey</CardTitle>
            <CardDescription className='max-w-xs'>
              Use your face, fingerprint, or security key to verify your
              identity.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4 pb-8'>
            <div className='flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/50 gap-4'>
              <div className='rounded-full bg-background p-4 shadow-sm'>
                <Fingerprint className='h-8 w-8 text-primary' />
              </div>
              <p className='text-sm text-muted-foreground text-center'>
                Click below to start the verification process related to your
                device.
              </p>
            </div>
            <Button
              className='w-full'
              size='lg'
              onClick={handleStartVerification}
            >
              <KeyRound className='mr-2 h-4 w-4' />
              Verify with Passkey
            </Button>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => window.history.back()}
            >
              Try another method
            </Button>
          </CardContent>
        </>
      )}

      {step === "proccess-passkey" && (
        <CardContent className='pt-6'>
          <ProccessPasskey />
        </CardContent>
      )}

      {step === "fail-passkey" && (
        <CardContent className='pt-6'>
          <FailPasskey
            tryAgainFunction={handleStartVerification}
            cancelFunction={() => setStep("initial")}
          />
        </CardContent>
      )}

      {step === "success-passkey" && (
        <CardContent className='pt-6'>
          <SuccessPasskey
            doneFunction={handleDone}
            title={"Passkey Verified"}
            description='You are successfully logged in with passkey'
          />
        </CardContent>
      )}
    </Card>
  );
}
