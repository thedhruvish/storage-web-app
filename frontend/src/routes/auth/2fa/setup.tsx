import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BackupCodes } from "@/pages/profile/2fa-components/backup-codes";
import { NameDevice } from "@/pages/profile/2fa-components/name-device";
import { SelectMethod } from "@/pages/profile/2fa-components/select-method";
import { SetupTotp } from "@/pages/profile/2fa-components/setup-totp";
import FailPasskey from "@/pages/profile/passkey-components/fail-passkey";
import ProccessPasskey from "@/pages/profile/passkey-components/proccess-passkey";
import SuccessPasskey from "@/pages/profile/passkey-components/success-passkey";
import { startRegistration } from "@simplewebauthn/browser";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  usePasskeysRegistrationVerify,
  useTotpVerify,
  useTwosteupSet,
} from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const Route = createFileRoute("/auth/2fa/setup")({
  component: SetupTwoFactorPage,
});

type Step =
  | "select"
  | "name"
  | "setup-totp"
  | "proccess-passkey"
  | "fail-passkey"
  | "success-passkey"
  | "backup-codes";

function SetupTwoFactorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("select");
  const [selectedMethod, setSelectedMethod] = useState<
    "totp" | "passkeys" | null
  >(null);
  const [friendlyName, setFriendlyName] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [setupData, setSetupData] = useState<{
    otpauthUrl: string;
    secret: string;
  } | null>(null);

  const setupMutation = useTwosteupSet();
  const verifyMutation = useTotpVerify();
  const passkeysVerifyMutation = usePasskeysRegistrationVerify();

  const handleSkip = () => {
    navigate({ to: "/app" });
  };

  const handleDone = () => {
    navigate({ to: "/app" });
  };

  const handleMethodSelect = (method: "totp" | "passkeys") => {
    setSelectedMethod(method);
    setStep("name");
  };

  const handleNameSubmit = (name: string) => {
    setFriendlyName(name);
    if (!selectedMethod) return;

    if (selectedMethod === "totp") {
      handleStartTotpSetup();
    } else {
      handleStartPasskeysSetup(name);
    }
  };

  const handleStartTotpSetup = () => {
    setStep("setup-totp");
    setupMutation.mutate(
      { method: "totp" },
      {
        onSuccess: (response: any) => {
          setSetupData({
            otpauthUrl: response.data.data.otpauthUrl,
            secret: response.data.data.secret,
          });
        },
      }
    );
  };

  const passkeysRegistration = async (optionsJSON: any, name: string) => {
    setStep("proccess-passkey");
    let attResp;

    try {
      attResp = await startRegistration({ optionsJSON });
    } catch (error: any) {
      if (error.name === "InvalidStateError") {
        toast.error(
          "Error: Authenticator was probably already registered by user"
        );
      } else {
        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
      setStep("fail-passkey");
      return;
    }

    if (!attResp) {
      setStep("fail-passkey");
      return;
    }

    passkeysVerifyMutation.mutate(
      { response: attResp, friendlyName: name },
      {
        onSuccess: () => {
          setStep("success-passkey");
          toast.success("Passkey registered successfully");
        },
        onError: () => {
          setStep("fail-passkey");
          toast.error("Failed to register passkey");
        },
      }
    );
  };

  const handleStartPasskeysSetup = (name: string) => {
    setupMutation.mutateAsync(
      { method: "passkeys" },
      {
        onSuccess: async (res) => {
          await passkeysRegistration(res.data.data, name);
        },
      }
    );
  };

  const handleVerifyToken = (code: string) => {
    verifyMutation.mutate(
      { token: code, friendlyName },
      {
        onSuccess: (response: any) => {
          setBackupCodes(response.data.data.recoveryCodes || []);
          setStep("backup-codes");
        },
      }
    );
  };

  return (
    <div className='container flex items-center justify-center min-h-[90vh] py-10'>
      <Card className='w-full max-w-2xl border-none shadow-none md:border md:shadow-sm'>
        {step !== "backup-codes" &&
          step !== "setup-totp" &&
          step !== "select" && (
            <CardHeader>
              {/* Header content managed by sub-components usually but we can wrap them */}
              {/* Actually sub-components have their own headers mostly. Let's see. */}
              {/* NameDevice has header. Passkey components have headers. SetupTotp has header. */}
              {/* SelectMethod does NOT have header. */}
            </CardHeader>
          )}

        <CardContent className='p-0 md:p-6'>
          {step === "select" && (
            <>
              <div className='flex flex-col items-center gap-2 text-center pb-6 pt-6'>
                <div className='bg-primary/10 text-primary mb-2 flex size-12 items-center justify-center rounded-full'>
                  <ShieldCheck className='size-6' />
                </div>
                <CardTitle className='text-xl'>Secure your account</CardTitle>
                <CardDescription className='max-w-xs mx-auto'>
                  Add an extra layer of security. Select a verification method
                  to setup.
                </CardDescription>
              </div>

              <SelectMethod
                handleMethodSelect={handleMethodSelect}
                isAllowedNewTOTP={true} // In setup flow, we assume they can add one, or we check logic. But assume new setup.
              />

              <div className='flex justify-center mt-6'>
                <Button variant='ghost' onClick={handleSkip}>
                  Skip for now
                </Button>
              </div>
            </>
          )}

          {step === "name" && (
            <div className='p-4 md:p-0'>
              <NameDevice
                onBack={() => setStep("select")}
                onSubmit={handleNameSubmit}
                isLoading={setupMutation.isPending}
              />
            </div>
          )}

          {step === "setup-totp" && (
            <div className='p-4 md:p-0'>
              <SetupTotp
                onBack={() => setStep("select")}
                isLoadingSetup={setupMutation.isPending}
                isErrorSetup={setupMutation.isError}
                onRetrySetup={handleStartTotpSetup}
                setupData={setupData}
                onVerify={handleVerifyToken}
                isVerifying={verifyMutation.isPending}
                verifyError={
                  (verifyMutation.error as any)?.response?.data?.message || null
                }
              />
            </div>
          )}

          {step === "proccess-passkey" && <ProccessPasskey />}

          {/* If passkey is success, we might want to skip backup codes if backend doesn't return them for passkey? 
                Usually passkeys don't generate recovery codes in this flow unless specified. 
                Wait, TwoFaDialog logic for passkey success just says "Done" and closes dialog. 
                So passkey success leads to "Done" -> App. 
                TOTP success leads to "Backup Codes" -> App.
            */}
          {step === "success-passkey" && (
            <SuccessPasskey
              doneFunction={handleDone}
              title='Passkey Added'
              description='Your passkey has been added successfully. You can now use it to login.'
            />
          )}

          {step === "fail-passkey" && (
            <FailPasskey
              cancelFunction={() => setStep("name")}
              tryAgainFunction={() => handleStartPasskeysSetup(friendlyName)}
            />
          )}

          {step === "backup-codes" && (
            <div className='p-4 md:p-0'>
              <BackupCodes backupCodes={backupCodes} onDone={handleDone} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
