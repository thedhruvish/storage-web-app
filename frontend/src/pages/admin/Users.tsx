import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAllUsers,
  useHardDeleteUser,
  useUserChangeRole,
} from "@/api/adminApi";
import { useUserDeleteStatusChange } from "@/api/adminApi";
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

export default function UsersList() {
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState("");

  const userDataQuery = useGetAllUsers();
  const deleteUserStatusMutation = useUserDeleteStatusChange();
  const deleteUserHard = useHardDeleteUser();
  const userChangeRole = useUserChangeRole();
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
  // handle soft delete
  const handleDelete = (id: string, isDeleted: boolean) => {
    const res = confirm("Are you Sure?");
    if (!res) return;
    deleteUserStatusMutation.mutate(
      { id, isDeleted: !isDeleted },
      {
        onSuccess: () => {
          toast.error("User soft deleted successfully");
        },
      }
    );
  };

  // handle hard delete
  const handleHardDelete = () => {
    if (!selectedUser) return;
    deleteUserHard.mutate(
      { id: selectedUser },
      {
        onSuccess: () => {
          toast.error("User hard deleted successfully");
          setOpenDeleteDialog(false);
        },
      }
    );
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
            {row.original.name.slice(0, 2).toUpperCase() || "CN"}
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
          Link
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
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {["owner", "admin", "manager", "user"].map((role) => (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => handleChangeRole(row.original._id, role)}
                    >
                      {role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                onClick={() =>
                  handleDelete(row.original._id, row.original.isDeleted)
                }
                className={`${
                  row.original.isDeleted ? "text-green-600" : " text-red-600"
                }`}
              >
                {row.original.isDeleted ? "Restore" : "Delete"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(row.original._id);
                  setOpenDeleteDialog(true);
                }}
                className=' text-red-600'
              >
                Hard Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        title={"Delete User"}
        open={openDeleteDialog}
        desc={"Are you Sure to delete this user"}
        handleConfirm={handleHardDelete}
        onOpenChange={setOpenDeleteDialog}
      />
    </div>
  );
}
