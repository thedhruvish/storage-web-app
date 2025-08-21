import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDialogStore } from "@/store/DialogsStore";
import {
  Check,
  Copy,
  Globe,
  Link as LinkIcon,
  Lock,
  Mail,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAddDirectoryPermission,
  useChangeDirectoryPermission,
  useCreateDirectoryShareShortLink,
  useGetDirectoryPermissionUsers,
  useRemoveDirectoryPermission,
} from "@/api/directoryApi";
import { truncateName } from "@/utils/truncateFileName";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const permissionOptions = ["manager", "editor", "viewer"] as const;

const shareFormSchema = z.object({
  linkAccess: z.enum(["restricted", "public"]),
  userPermission: z.enum(permissionOptions),
  inviteEmails: z.string().optional(),
});

type ShareFormValues = z.infer<typeof shareFormSchema>;

type InvitedUser = {
  name: string;
  email: string;
  picture: string;
  _id: string;
};

interface InvitedUserType {
  role: "manager" | "editor" | "viewer";
  _id: string;
  userId: InvitedUser;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const { currentItem: item, closeDialog } = useDialogStore();

  const getDirectoryQuery = useGetDirectoryPermissionUsers(item?._id);
  const addDirectoryMutation = useAddDirectoryPermission();
  const removeDirectoryMutation = useRemoveDirectoryPermission();
  const changeDirectoryPermission = useChangeDirectoryPermission();
  const createDirectoryShareLinkMutation = useCreateDirectoryShareShortLink();

  const [shareLink, setShareLink] = React.useState("");

  const [copied, setCopied] = React.useState(false);

  const [invitedUsers, setInvitedUsers] = React.useState<
    Array<InvitedUserType> | []
  >([]);
  const BASE_URL = `${import.meta.env.VITE_BASE_URL}`;

  React.useEffect(() => {
    if (getDirectoryQuery.isSuccess) {
      setShareLink(getDirectoryQuery.data.data?.shareLink?.link || "");
      setInvitedUsers(getDirectoryQuery.data.data.directory.permission);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getDirectoryQuery.isSuccess]);

  const form = useForm<ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      linkAccess: "restricted",
      userPermission: "viewer",
      inviteEmails: "",
    },
  });

  const { linkAccess } = form.watch();
  // copy link
  const copyToClipboard = () => {
    if (linkAccess === "restricted") {
      navigator.clipboard.writeText(`${BASE_URL}/directory/${item?._id}`);
    } else {
      navigator.clipboard.writeText(`${BASE_URL}/share/${shareLink}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  // on submit the share user
  const onSubmit = (values: ShareFormValues) => {
    if (!item || !values.inviteEmails) return;

    addDirectoryMutation.mutate(
      {
        dirId: item._id,
        data: {
          email: values.inviteEmails,
          role: values.userPermission,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          toast.success("Invitation sent");
        },
      }
    );
  };

  // remove user for the email share
  const removeInvitedUser = (id: string) => {
    if (!item) return;
    setInvitedUsers((prev) => prev.filter((u) => u._id !== id));
    removeDirectoryMutation.mutate(
      {
        dirId: item._id,
        data: {
          userId: id,
        },
      },
      {
        onSuccess: () => {
          toast.success("Invitation removed");
        },
      }
    );
  };

  // change the permission on the change users
  const changePermission = (userId: string, role: string) => {
    if (!item?._id) return;
    changeDirectoryPermission.mutate({
      dirId: item._id,
      data: {
        role,
        userId,
      },
    });
  };

  // close the dialog
  const closeAll = () => {
    closeDialog();
    setShareLink("");
    form.reset();
  };
  // share public link create
  const onDoneButton = () => {
    if (!item?._id || !shareLink || linkAccess !== "public") {
      closeAll();
      return;
    }
    if (shareLink.length < 3) {
      toast.error("Link Must be less than 3 characters");
      return;
    }
    if (getDirectoryQuery.data.data?.shareLink?.link === shareLink) {
      closeAll();
      return;
    }
    createDirectoryShareLinkMutation.mutate(
      {
        dirId: item._id,
        data: {
          shareLink,
        },
      },
      {
        onSuccess: () => {
          toast.success(`you link is this ${shareLink}`);
          closeDialog();
          setShareLink("");
          form.reset();
        },
        onError(error) {
          toast.error(error.message);
        },
      }
    );
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <div className='rounded-lg bg-blue-50 p-2 dark:bg-blue-950'>
                  {item.type === "file" ? (
                    <Users className='h-4 w-4 text-blue-600' />
                  ) : (
                    <LinkIcon className='h-4 w-4 text-blue-600' />
                  )}
                </div>
                Share "{truncateName(item.name)}"
              </DialogTitle>
              <DialogDescription>
                Share this {item.fileType} with others by sending them a link or
                inviting them directly.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-6 pt-4'>
              <Separator />

              {/* Invite people */}
              <div>
                <FormField
                  control={form.control}
                  name='inviteEmails'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite people</FormLabel>
                      <FormControl>
                        <div className='flex flex-1 items-center gap-2'>
                          <Input
                            placeholder='Enter email addresses'
                            className='flex-1'
                            {...field}
                          />
                          <Button type='submit'>
                            <Mail className='mr-2 h-4 w-4' />
                            Invite
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter name to want share this file
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* People with access */}
              <div>
                <Label className='text-sm font-medium'>
                  People with access
                </Label>
                <div className='mt-2 space-y-2'>
                  {invitedUsers.map((user) => (
                    <div
                      key={user._id}
                      className='flex items-center justify-between rounded-lg border p-2'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage
                            src={user.userId.picture || "/placeholder.svg"}
                            alt={user.userId.name}
                          />
                          <AvatarFallback>
                            {user.userId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className='text-sm font-medium'>
                            {user.userId.name}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {user.userId.email}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Select
                          defaultValue={user.role}
                          onValueChange={(newRole) =>
                            changePermission(user._id, newRole)
                          }
                        >
                          <SelectTrigger className='h-8 w-24'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permissionOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option[0].toUpperCase() + option.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive h-8 w-8 p-0'
                          onClick={() => removeInvitedUser(user.userId._id)}
                        >
                          <X />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Share link */}
              <div>
                <div className='mb-3 flex items-center justify-between'>
                  <Label className='text-sm font-medium'>Share link</Label>
                  <Badge
                    variant={linkAccess === "public" ? "default" : "secondary"}
                    className='text-xs'
                  >
                    {linkAccess === "public" ? (
                      <>
                        <Globe className='mr-1 h-3 w-3' />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className='mr-1 h-3 w-3' />
                        Restricted
                      </>
                    )}
                  </Badge>
                </div>

                <div className='space-y-3'>
                  <div className='flex gap-2'>
                    <Select
                      value={linkAccess}
                      onValueChange={(v) =>
                        form.setValue(
                          "linkAccess",
                          v as "restricted" | "public"
                        )
                      }
                    >
                      <SelectTrigger className='flex-1'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='restricted'>
                          <div className='flex items-center gap-2'>
                            <Lock className='h-4 w-4' />
                            <span>Restricted</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='public'>
                          <div className='flex items-center gap-2'>
                            <Globe className='h-4 w-4' />
                            <span>Anyone with link</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex gap-2'>
                    {linkAccess !== "public" ? (
                      // FULL read-only for restricted links
                      <Input
                        value={`${BASE_URL}/directory/${item._id}`}
                        readOnly
                        disabled
                        className='flex-1'
                      />
                    ) : (
                      <div className='border-input flex flex-1 overflow-hidden rounded-md border'>
                        {/* Read-only prefix */}
                        <input
                          type='text'
                          value={`${BASE_URL}/share/`}
                          readOnly
                          className='bg-muted text-muted-foreground w-auto border-0 px-3 py-2 text-sm outline-none'
                        />

                        {/* Editable suffix */}
                        <input
                          type='text'
                          value={shareLink}
                          onChange={(e) => setShareLink(e.target.value)}
                          className='flex-1 border-0 px-3 py-2 text-sm outline-none'
                        />
                      </div>
                    )}

                    {/* Copy button */}
                    <Button
                      type='button'
                      onClick={copyToClipboard}
                      variant='outline'
                      size='icon'
                    >
                      {copied ? (
                        <Check className='h-4 w-4' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button variant='outline' onClick={closeAll} type='button'>
                Cancel
              </Button>
              <Button type='button' onClick={onDoneButton}>
                Done
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
