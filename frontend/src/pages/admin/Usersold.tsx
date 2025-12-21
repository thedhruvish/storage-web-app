import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useUser } from "@/store/user-store";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllUsers,
  useHardDeleteUser,
  useUserChangeRole,
  useUserLogoutAllDevices,
} from "@/api/admin-api";
import { useUserDeleteStatusChange } from "@/api/admin-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";

export interface User {
  name: string;
  email: string;
  loginProvider: string;
  picture: string;
  _id: string;
  role: string;
  rootDirId: string;
  isDeleted: boolean;
}
type DialogState = {
  title?: string;
  description?: string;
  userId: string;
  type: string;
  handleDialog: () => void;
};

export function UsersList() {
  const { user } = useUser();
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [handleConfimDialog, setHandleConfirmDialog] = useState<DialogState>({
    title: "",
    description: "",
    userId: "",
    type: "",
    handleDialog: () => {},
  });

  const userDataQuery = useGetAllUsers();
  const deleteUserStatusMutation = useUserDeleteStatusChange();
  const deleteUserHard = useHardDeleteUser();
  const userChangeRole = useUserChangeRole();
  const userLogoutAllDevicesMutation = useUserLogoutAllDevices();
  // handle user role
  const handleChangeRole = (id: string, role: string) => {
    userChangeRole.mutate(
      { id, role },
      {
        onSuccess: () => {
          toast.success("Role change successfully");
        },
      }
    );
  };

  // user logout all devices
  const handleAllDevicesLogout = (id: string) => {
    userLogoutAllDevicesMutation.mutate(
      {
        id,
      },
      {
        onSuccess: () => {
          toast.success("User logout all devices successfully");
          setOpenDeleteDialog(false);
          userDataQuery.refetch();
        },
        onError(error) {
          toast.error(error.message || "User Logout Error");
        },
      }
    );
  };

  // handle soft delete
  const handleDelete = (id: string, isDeleted: boolean) => {
    deleteUserStatusMutation.mutate(
      { id, isDeleted: !isDeleted },
      {
        onSuccess: () => {
          toast.error("User soft deleted successfully");
          setOpenDeleteDialog(false);
        },
      }
    );
  };

  // handle hard delete
  const handleHardDelete = (id: string) => {
    deleteUserHard.mutate(
      { id },
      {
        onSuccess: () => {
          toast.error("User hard deleted successfully");
          setOpenDeleteDialog(false);
        },
      }
    );
  };

  const openDialog = (
    userId: string,
    type: "HARD_DELETE" | "SOFT_DELETE" | "LOGOUT_ALL",
    isDeleted?: boolean
  ) => {
    let dialog: Partial<DialogState> = {};

    if (type === "HARD_DELETE") {
      dialog = {
        title: "Delete User for Permanent",
        description:
          "Are you sure you want to permanently delete this user? This action cannot be undone.",
        handleDialog: () => handleHardDelete(userId),
      };
    } else if (type === "SOFT_DELETE") {
      dialog = {
        title: `${isDeleted ? "Restore" : "Soft Delete"} User `,
        description: `this user will be ${isDeleted ? "restored" : "soft deleted"}`,
        handleDialog: () => handleDelete(userId, isDeleted || false),
      };
    } else if (type === "LOGOUT_ALL") {
      dialog = {
        title: "Logout All Devices",
        description: "this user will be logged out from all devices",
        handleDialog: () => handleAllDevicesLogout(userId),
      };
    }

    setHandleConfirmDialog({ ...(dialog as DialogState), userId, type: type });
    setOpenDeleteDialog(true);
  };

  // all the columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "picture",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Picture' />
      ),
      cell: ({ row }) => (
        <Avatar className={"h-10 w-10 rounded-full object-cover"}>
          <AvatarImage
            src={row.original.picture}
            alt={row.original.name || ""}
          />
          <AvatarFallback className='rounded-lg'>
            {row.original.name.slice(0, 2).toUpperCase() || "DH"}
          </AvatarFallback>
        </Avatar>
      ),
      enableColumnFilter: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      meta: { filterVariant: "text" },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      meta: { filterVariant: "text" },
    },

    {
      accessorKey: "loginProvider",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Login Provider' />
      ),
      meta: { filterVariant: "select" },
    },

    {
      accessorKey: "rootDirId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Open Directory' />
      ),
      cell: ({ row }) => (
        <a
          href={`directory/${row.original.rootDirId}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 underline hover:text-blue-800'
        >
          <Button variant='link'>Open Directory</Button>
        </a>
      ),
      enableColumnFilter: false,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Role' />
      ),
    },
    {
      accessorKey: "isDeleted",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Deleted' />
      ),

      cell: ({ row }) => (row.original.isDeleted ? "Yes" : "No"),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div>
          {(user?.role == "owner" || row.original.role !== "owner") && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {user?.role === "owner" && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {["owner", "admin", "user"].map((role) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() =>
                            handleChangeRole(row.original._id, role)
                          }
                        >
                          {role}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    openDialog(row.original._id, "LOGOUT_ALL");
                  }}
                >
                  Logout All
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    openDialog(
                      row.original._id,
                      "SOFT_DELETE",
                      row.original.isDeleted
                    )
                  }
                  className={`${
                    row.original.isDeleted ? "text-green-600" : " text-red-600"
                  }`}
                >
                  {row.original.isDeleted ? "Restore" : "Soft Delete"}
                </DropdownMenuItem>
                {user?.role === "owner" && (
                  <DropdownMenuItem
                    onClick={() => {
                      openDialog(row.original._id, "HARD_DELETE");
                    }}
                    className=' text-red-600'
                  >
                    Hard Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];

  return (
    <div className='p-4 '>
      <div className='text-2xl font-bold'>Users List</div>
      {userDataQuery.isError && (
        <div className='text-red-500'>Error: {userDataQuery.error.message}</div>
      )}
      {userDataQuery.isLoading && <div>Loading...</div>}
      {userDataQuery.isSuccess && (
        <DataTable
          columns={columns}
          data={userDataQuery.data?.users || []}
          searchKey='email'
          showRowSelection
        />
      )}
      <ConfirmDialog
        title={handleConfimDialog?.title}
        open={openDeleteDialog}
        desc={handleConfimDialog?.description || "Are you sure?"}
        handleConfirm={handleConfimDialog.handleDialog}
        onOpenChange={setOpenDeleteDialog}
      />
    </div>
  );
}
