import { useState } from "react";
import {
  KeyRound,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Fingerprint,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDeleteTwoFactorMethod,
  useToggleTwoFactor,
} from "@/api/setting-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SectionHeader } from "./section-header";
import SignInMethods from "./sign-in-method";
import { TwoFaDialog } from "./two-fa-dialog";
import type { TwoFactorMethod, Authenticate } from "./types";

interface SecuritySettingsProps {
  twoFactor: TwoFactorMethod[];
  authenticate: Authenticate[];
  isTwoFactorEnabled: boolean;
  twoFactorId: string;
  isAllowedNewTOTP: boolean;
}

export function SecuritySettings({
  authenticate,
  twoFactor,
  isTwoFactorEnabled = false,
  twoFactorId,
  isAllowedNewTOTP,
}: SecuritySettingsProps) {
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [isToggle2FAOpen, setIsToggle2FAOpen] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [methodToDelete, setMethodToDelete] = useState<TwoFactorMethod | null>(
    null
  );
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const {
    mutateAsync: deleteTwoFactorMethod,
    isPending: deleteTwoFactorMethodIsPending,
  } = useDeleteTwoFactorMethod(twoFactorId);

  const {
    mutateAsync: toggleTwoFactorMethod,
    isPending: toggleTwoFactorMethodIsPending,
  } = useToggleTwoFactor();

  const handleDeleteMethod = (method: TwoFactorMethod) => {
    setMethodToDelete(method);
    setDeleteConfirmationText("");
    const typeMethod = method.type;
    if (typeMethod === "passkey") {
      // credentils id is lenght was 43
      setDeleteDialogOpen(method.credentialID);
    } else {
      setDeleteDialogOpen(method.friendlyName);
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialogOpen) {
      return;
    }
    toast.promise(deleteTwoFactorMethod(deleteDialogOpen), {
      loading: "Removing...",
      success: () => {
        setDeleteDialogOpen(null);
        setMethodToDelete(null);
        return "Method removed successfully";
      },
      error: "Failed to remove method",
    });
  };

  const handleDisable2FA = async () => {
    toast.promise(toggleTwoFactorMethod(twoFactorId), {
      loading: "Disabling 2FA...",
      success: () => {
        setIsToggle2FAOpen(false);
        return "Two-factor authentication disabled";
      },
      error: "Failed to disable 2FA",
    });
  };

  // Format Date Helper
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className='space-y-8 animate-in fade-in duration-500'>
      <SectionHeader
        title='Security & Login'
        infoTooltip='Manage how you sign in and secure your account.'
      />

      {/* --- Section 1: Sign-in Methods --- */}
      <SignInMethods authenticate={authenticate} />

      <div
        className={`rounded-xl border bg-card shadow-sm overflow-hidden transition-all duration-300 ${isTwoFactorEnabled ? "ring-1 ring-primary/20" : ""}`}
      >
        <div className='p-4 border-b bg-muted/40 flex items-center justify-between'>
          <div>
            <h4 className='font-semibold text-sm flex items-center gap-2'>
              <ShieldCheck
                className={`h-4 w-4 ${isTwoFactorEnabled ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
              />
              Two-Step Verification
            </h4>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Add an extra layer of security to your account.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Label
              htmlFor='2fa-toggle'
              className='text-xs font-normal text-muted-foreground hidden sm:block'
            >
              {isTwoFactorEnabled ? "Enabled" : "Disabled"}
            </Label>
            <Switch
              id='2fa-toggle'
              checked={isTwoFactorEnabled}
              onCheckedChange={() => {
                if (twoFactor.length === 0) {
                  setIs2FADialogOpen(true);
                } else {
                  setIsToggle2FAOpen(true);
                }
              }}
            />
          </div>
        </div>

        {/* 2FA Content Body */}
        {isTwoFactorEnabled ? (
          <div className='divide-y'>
            {/* Header / Add Button Row */}
            <div className='p-4 bg-muted/10 flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                <span className='font-medium text-foreground'>
                  {twoFactor.length} active methods
                </span>{" "}
                protecting your account.
              </p>
              <Button
                size='sm'
                onClick={() => setIs2FADialogOpen(true)}
                className='gap-2 h-8'
              >
                <Plus className='h-3.5 w-3.5' />
                Add Method
              </Button>
            </div>

            {/* Methods List */}
            {twoFactor.length > 0 ? (
              <div className='divide-y'>
                {twoFactor.map((method) => (
                  <div
                    key={method._id || method.createdAt.toString()}
                    className='flex items-center justify-between p-4 pl-6 hover:bg-muted/20 transition-colors group'
                  >
                    <div className='flex items-center gap-4'>
                      {/* Dynamic Icon based on type */}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm ${
                          method.type === "passkey"
                            ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
                            : "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                        }`}
                      >
                        {method.type === "passkey" ? (
                          method.transports?.includes("usb") ? (
                            <KeyRound className='h-5 w-5' />
                          ) : (
                            <Fingerprint className='h-5 w-5' />
                          )
                        ) : (
                          <QrCode className='h-5 w-5' />
                        )}
                      </div>

                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='font-medium text-sm'>
                            {method.friendlyName ||
                              (method.type === "passkey"
                                ? "Passkey"
                                : "Authenticator App")}
                          </p>
                          {/* Optional: Show 'Last Used' badge if available */}
                          {method.lastUsed && (
                            <Badge
                              variant='outline'
                              className='text-[10px] h-4 px-1 text-muted-foreground font-normal'
                            >
                              Last used {formatDate(method.lastUsed)}
                            </Badge>
                          )}
                        </div>

                        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                          <span>
                            {method.type === "passkey"
                              ? "Biometric / Hardware Key"
                              : "TOTP Code Generator"}
                          </span>
                          <span>•</span>
                          <span>Added {formatDate(method.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              onClick={() => handleDeleteMethod(method)}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side='left'>
                            Remove this method
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Edge case: Enabled but no methods (shouldn't happen logically but good for UI safety)
              <div className='p-8 text-center'>
                <div className='mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mb-3'>
                  <AlertCircle className='h-6 w-6' />
                </div>
                <h3 className='text-sm font-medium'>
                  Configuration Incomplete
                </h3>
                <p className='text-xs text-muted-foreground max-w-xs mx-auto mt-1 mb-4'>
                  Two-factor authentication is on, but you haven't added any
                  methods yet.
                </p>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIs2FADialogOpen(true)}
                >
                  Configure Now
                </Button>
              </div>
            )}
          </div>
        ) : twoFactor === null ? (
          <div className='p-8 text-center'>
            <div className='mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mb-3'>
              <AlertCircle className='h-6 w-6' />
            </div>
            <h3 className='text-sm font-medium'>Configuration Incomplete</h3>
            <p className='text-xs text-muted-foreground max-w-xs mx-auto mt-1 mb-4'>
              Two-factor authentication is on, but you haven't added any methods
              yet.
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIs2FADialogOpen(true)}
            >
              Configure Now
            </Button>
          </div>
        ) : (
          // Empty State (2FA Disabled)
          <div className='p-8 flex flex-col items-center justify-center text-center bg-muted/5'>
            <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4'>
              <ShieldCheck className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='font-medium text-sm'>Secure your account</h3>
            <p className='text-xs text-muted-foreground max-w-sm mt-1 mb-6'>
              Two-factor authentication adds an extra layer of security to your
              account by requiring more than just a password to log in.
            </p>
            <Button
              onClick={() => {
                if (twoFactor.length === 0) {
                  setIs2FADialogOpen(true);
                } else {
                  setIsToggle2FAOpen(true);
                }
              }}
            >
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}
      </div>

      {/* 2FA Setup Dialog */}
      <TwoFaDialog
        is2FADialogOpen={is2FADialogOpen}
        setIs2FADialogOpen={setIs2FADialogOpen}
        isAllowedNewTOTP={isAllowedNewTOTP}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(null);
          }
        }}
        title='Remove Authentication Method?'
        destructive
        disabled={deleteConfirmationText !== "delete"}
        desc={
          <div className='space-y-3'>
            <p>
              Are you sure you want to remove{" "}
              <span className='font-semibold text-foreground'>
                {methodToDelete?.friendlyName || "this method"}
              </span>
              ?
            </p>
            <div className='rounded-md bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2'>
              <AlertCircle className='h-4 w-4 shrink-0 mt-0.5' />
              <p>
                If you lose access to your other methods, you may be locked out
                of your account.
              </p>
            </div>
          </div>
        }
        confirmText={
          deleteTwoFactorMethodIsPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Removing...
            </>
          ) : (
            "Remove Method"
          )
        }
        handleConfirm={confirmDelete}
        isLoading={deleteTwoFactorMethodIsPending}
      >
        <div className='space-y-2 mt-4'>
          <Label className='text-xs text-muted-foreground'>
            Type{" "}
            <span className='font-mono font-bold text-foreground'>delete</span>{" "}
            to confirm
          </Label>
          <Input
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder='delete'
            className='font-mono'
          />
        </div>
      </ConfirmDialog>

      {/* Disable 2FA Confirmation Dialog */}
      <ConfirmDialog
        open={isToggle2FAOpen}
        onOpenChange={setIsToggle2FAOpen}
        title='Disable Two-Factor Authentication?'
        destructive={isTwoFactorEnabled}
        desc='Are you sure you want to disable two-factor authentication? Your account will be less secure.'
        confirmText={
          toggleTwoFactorMethodIsPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              {isTwoFactorEnabled ? "Disabling..." : "Enabling..."}
            </>
          ) : isTwoFactorEnabled ? (
            "Disable"
          ) : (
            "Enable"
          )
        }
        handleConfirm={handleDisable2FA}
        isLoading={toggleTwoFactorMethodIsPending}
      />
    </div>
  );
}
