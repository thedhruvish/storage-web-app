import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Info, Sparkles, Pencil, Camera, Upload } from "lucide-react";
import { useStorageStatus } from "@/hooks/use-storage-status";
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
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatarProfile } from "@/components/user-avatar-profile";
import type { UserProfile } from "./types";

interface ProfileHeaderProps {
  user: UserProfile;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { totalUsedBytes, maxStorageBytes, storageUsedPercentage } =
    useStorageStatus();
  // Mocking update state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState(user.name);

  const showUpgrade = !user.isPremium;

  return (
    <div className='rounded-xl border bg-card text-card-foreground shadow-sm p-6 relative overflow-hidden'>
      <div className='flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10'>
        {/* Identity */}
        <div className='flex items-center gap-5'>
          <div className='relative group'>
            {/* Premium Ring Logic */}
            <div
              className={`rounded-full p-1 ${user.isPremium ? "bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500" : "bg-transparent"}`}
            >
              <div className='bg-card rounded-full p-0.5'>
                <UserAvatarProfile
                  user={user}
                  className='h-16 w-16 text-2xl md:h-20 md:w-20 md:text-3xl'
                  showInfo={false}
                />
              </div>
            </div>
            {/* Quick Edit Overlay on Avatar */}
            <button
              onClick={() => setIsEditOpen(true)}
              className='absolute bottom-1 right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity'
            >
              <Pencil className='w-3 h-3' />
            </button>
          </div>

          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <h2 className='text-2xl font-bold tracking-tight'>{user.name}</h2>
              {user.isPremium && (
                <span className='px-2 py-0.5 rounded-full bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-200 dark:border-indigo-900'>
                  Pro
                </span>
              )}
            </div>
            <p className='text-sm text-muted-foreground'>{user.email}</p>

            <Button
              variant='link'
              className='h-auto p-0 text-xs text-primary/80 hover:text-primary'
              onClick={() => setIsEditOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Separator for mobile */}
        <div className='h-px bg-border md:hidden' />

        {/* Storage Logic */}
        <div className='w-full md:max-w-xs space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-1.5'>
              <span className='font-medium'>Storage</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-3.5 w-3.5 text-muted-foreground' />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Includes Photos, Drive, and Email</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className='text-muted-foreground text-xs'>
              {totalUsedBytes} of {maxStorageBytes}
            </span>
          </div>

          <Progress value={storageUsedPercentage} className='h-2.5' />

          {showUpgrade && (
            <Button
              asChild
              className='w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 hover:opacity-90 transition-opacity'
              size='sm'
            >
              <Link to='/pricing'>
                <Sparkles className='mr-2 h-4 w-4' />
                Upgrade Plan
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-6 py-4'>
            <div className='flex flex-col items-center gap-4'>
              <div className='relative'>
                <UserAvatarProfile
                  user={user}
                  className='h-24 w-24 text-4xl'
                  showInfo={false}
                />
                <div className='absolute bottom-0 right-0'>
                  <Button
                    size='icon'
                    variant='secondary'
                    className='rounded-full h-8 w-8 shadow-sm'
                  >
                    <Camera className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='w-full max-w-[150px]'
              >
                <Upload className='mr-2 h-3 w-3' />
                Change Avatar
              </Button>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Display Name</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' onClick={() => setIsEditOpen(false)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
