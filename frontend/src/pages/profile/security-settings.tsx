import { useState } from "react";
import { Mail, Github, Smartphone, KeyRound, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionHeader } from "./section-header";
import { TwoFaDialog } from "./two-fa-dialog";
import type { TwoFactorType, ConnectedAccount } from "./types";

interface SecuritySettingsProps {
  connectedAccounts: ConnectedAccount[];
  twoFactorType: TwoFactorType;
}

export function SecuritySettings({
  connectedAccounts,
  twoFactorType,
}: SecuritySettingsProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  // 2FA State
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);

  // Helper to find specific account status
  const getAccount = (provider: string) =>
    connectedAccounts.find((acc) => acc.provider === provider);
  const googleAccount = getAccount("google");
  const githubAccount = getAccount("github");
  const passwordAccount = getAccount("password");

  return (
    <div className='space-y-6'>
      <SectionHeader
        title='Security'
        infoTooltip='Manage your sign-in methods and account security.'
      />

      <div className='rounded-xl border bg-card shadow-sm overflow-hidden'>
        <div className='p-4 border-b bg-muted/30'>
          <h4 className='font-medium text-sm'>Sign-in Methods</h4>
        </div>

        <div className='divide-y'>
          {/* 1. Password Method */}
          <div className='flex items-center justify-between p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'>
                <Lock className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>Password</p>
                <p className='text-sm text-muted-foreground'>
                  {passwordAccount?.isConnected
                    ? "Securely set on this account"
                    : "Not set yet"}
                </p>
              </div>
            </div>
            {passwordAccount?.isConnected ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsPasswordDialogOpen(true)}
              >
                Change
              </Button>
            ) : (
              <Button size='sm' onClick={() => setIsPasswordDialogOpen(true)}>
                Set Password
              </Button>
            )}
          </div>

          {/* 2. Google Method */}
          <div className='flex items-center justify-between p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'>
                <Mail className='h-5 w-5' />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <p className='font-medium'>Google</p>
                  {googleAccount?.isConnected && (
                    <span className='inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-400'>
                      Connected
                    </span>
                  )}
                </div>
                <p className='text-sm text-muted-foreground'>
                  {googleAccount?.isConnected
                    ? googleAccount.email
                    : "Use your Google account to log in"}
                </p>
              </div>
            </div>
            {googleAccount?.isConnected ? (
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
              >
                Disconnect
              </Button>
            ) : (
              <Button variant='outline' size='sm'>
                <Plus className='w-3.5 h-3.5 mr-1.5' />
                Connect
              </Button>
            )}
          </div>

          {/* 3. GitHub Method */}
          <div className='flex items-center justify-between p-4'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'>
                <Github className='h-5 w-5' />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <p className='font-medium'>GitHub</p>
                  {githubAccount?.isConnected && (
                    <span className='inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-400'>
                      Connected
                    </span>
                  )}
                </div>
                <p className='text-sm text-muted-foreground'>
                  {githubAccount?.isConnected
                    ? githubAccount.email
                    : "Use your GitHub account to log in"}
                </p>
              </div>
            </div>
            {githubAccount?.isConnected ? (
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
              >
                Disconnect
              </Button>
            ) : (
              <Button variant='outline' size='sm'>
                <Plus className='w-3.5 h-3.5 mr-1.5' />
                Connect
              </Button>
            )}
          </div>
        </div>

        {/* 2FA Section - Visual separation */}
        <div className='border-t p-4 bg-muted/10'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${twoFactorType ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {twoFactorType === "passkey" ? (
                  <KeyRound className='h-5 w-5' />
                ) : (
                  <Smartphone className='h-5 w-5' />
                )}
              </div>
              <div>
                <h4 className='font-medium'>2-Step Verification</h4>
                <p className='text-sm text-muted-foreground'>
                  {twoFactorType ? "Active" : "Add an extra layer of security."}
                </p>
              </div>
            </div>
            <Switch
              checked={!!twoFactorType}
              onCheckedChange={(checked) => {
                if (checked) setIs2FADialogOpen(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {passwordAccount?.isConnected
                ? "Change Password"
                : "Set Password"}
            </DialogTitle>
            <DialogDescription>
              Enter your new password below.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='new-password'>New Password</Label>
              <Input id='new-password' type='password' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirm-password'>Confirm Password</Label>
              <Input id='confirm-password' type='password' />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsPasswordDialogOpen(false)}>
              Save Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TwoFaDialog
        is2FADialogOpen={is2FADialogOpen}
        setIs2FADialogOpen={(e) => setIs2FADialogOpen(e)}
      />
    </div>
  );
}
