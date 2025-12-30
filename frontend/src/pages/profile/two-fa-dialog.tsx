import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { toast } from "sonner";
import {
  usePasskeysRegistrationVerify,
  useTotpVerify,
  useTwosteupSet,
} from "@/api/auth";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BackupCodes } from "./2fa-components/backup-codes";
import { NameDevice } from "./2fa-components/name-device";
import { SelectMethod } from "./2fa-components/select-method";
import { SetupTotp } from "./2fa-components/setup-totp";
import FailPasskey from "./passkey-components/fail-passkey";
import ProccessPasskey from "./passkey-components/proccess-passkey";
import SuccessPasskey from "./passkey-components/success-passkey";

// 1. Update the Step Type
type DialogStep =
  | "select"
  | "name"
  | "setup-totp"
  | "proccess-passkey"
  | "fail-passkey"
  | "success-passkey"
  | "backup-codes";

interface TwoFaDialogProps {
  setIs2FADialogOpen: (d: boolean) => void;
  is2FADialogOpen: boolean;
  isAllowedNewTOTP: boolean;
}

export function TwoFaDialog({
  setIs2FADialogOpen,
  is2FADialogOpen,
  isAllowedNewTOTP,
}: TwoFaDialogProps) {
  const [dialogStep, setDialogStep] = useState<DialogStep>("select");
  const [selectedMethod, setSelectedMethod] = useState<
    "totp" | "passkeys" | null
  >(null);
  const [friendlyName, setFriendlyName] = useState("");

  // 2. State for Backup Codes
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [setupData, setSetupData] = useState<{
    otpauthUrl: string;
    secret: string;
  } | null>(null);

  const setupMutation = useTwosteupSet();
  const verifyMutation = useTotpVerify();
  const passkeysVerifyMutation = usePasskeysRegistrationVerify();

  const handleOpenChange = (open: boolean) => {
    // Prevent closing if on backup step (force them to click 'Done')
    if (!open && dialogStep === "backup-codes") {
      return;
    }

    setIs2FADialogOpen(open);
    if (!open) {
      setTimeout(() => {
        setDialogStep("select");
        setSelectedMethod(null);
        setFriendlyName("");
        setSetupData(null);
        setBackupCodes([]);
        setupMutation.reset();
        verifyMutation.reset();
      }, 300);
    }
  };

  const handleMethodSelect = (method: "totp" | "passkeys") => {
    setSelectedMethod(method);
    setDialogStep("name");
  };

  const handleNameSubmit = (name: string) => {
    setFriendlyName(name);
    if (!selectedMethod) return;

    if (selectedMethod === "totp") {
      handleStartTotpSetup();
    } else {
      handleStartPasskeysSetup(name); // pass name directly to avoid state lag issues if any
    }
  };

  const handleStartTotpSetup = () => {
    setDialogStep("setup-totp");
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
    setDialogStep("proccess-passkey");
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
      setDialogStep("fail-passkey");
      return;
    }

    if (!attResp) {
      setDialogStep("fail-passkey");
      return;
    }

    passkeysVerifyMutation.mutate(
      { response: attResp, friendlyName: name },
      {
        onSuccess: () => {
          setDialogStep("success-passkey");
          toast.success("Passkey registered successfully");
        },
        onError: () => {
          setDialogStep("fail-passkey");
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
          // 3. Capture codes and switch step
          // Assuming response structure: response.data.data.recoveryCodes
          setBackupCodes(response.data.data.recoveryCodes || []);
          setDialogStep("backup-codes");
        },
      }
    );
  };

  return (
    <Dialog open={is2FADialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "transition-all duration-300 ease-in-out",
          // Widen dialog for backup codes view
          dialogStep === "setup-totp" || dialogStep === "backup-codes"
            ? "sm:max-w-2xl"
            : "sm:max-w-md"
        )}
      >
        {dialogStep === "select" && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Verification Method</DialogTitle>
              <DialogDescription>
                Select how you want to authenticate.
              </DialogDescription>
            </DialogHeader>
            <SelectMethod
              handleMethodSelect={handleMethodSelect}
              isAllowedNewTOTP={isAllowedNewTOTP}
            />
          </>
        )}

        {dialogStep === "name" && (
          <NameDevice
            onBack={() => setDialogStep("select")}
            onSubmit={handleNameSubmit}
            isLoading={setupMutation.isPending}
          />
        )}

        {/* STEP 2: SETUP TOTP */}
        {dialogStep === "setup-totp" && (
          <SetupTotp
            onBack={() => setDialogStep("select")}
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
        )}

        {/* PASSKEY STEPS */}
        {dialogStep === "proccess-passkey" && <ProccessPasskey />}

        {dialogStep === "success-passkey" && (
          <SuccessPasskey doneFunction={() => setIs2FADialogOpen(false)} />
        )}

        {dialogStep === "fail-passkey" && (
          <FailPasskey
            cancelFunction={() => setDialogStep("name")}
            tryAgainFunction={() => handleStartPasskeysSetup(friendlyName)}
          />
        )}

        {/* STEP 3: BACKUP CODES  */}
        {dialogStep === "backup-codes" && (
          <BackupCodes
            backupCodes={backupCodes}
            onDone={() => {
              setBackupCodes([]);
              setIs2FADialogOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
