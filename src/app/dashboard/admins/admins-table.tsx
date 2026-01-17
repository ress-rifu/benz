import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { AdminActions } from "./admin-actions";
import { getUser } from "@/lib/auth/get-user";

async function getAdmins() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function AdminsTable() {
  const [admins, currentUser] = await Promise.all([
    getAdmins(),
    getUser(),
  ]);

  if (admins.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        <p className="text-slate-500">No admin users yet</p>
        <p className="mt-1 text-sm text-slate-400">
          Add your first admin user to get started
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">
                  {admin.name}
                  {currentUser?.id === admin.id && (
                    <Badge variant="outline" className="ml-2">
                      You
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-slate-500">
                  @{admin.username}
                </TableCell>
                <TableCell className="text-slate-500">
                  {admin.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={admin.role === "super_admin" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {admin.role.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500">
                  {formatDate(admin.created_at)}
                </TableCell>
                <TableCell>
                  {currentUser?.id !== admin.id && (
                    <AdminActions admin={admin} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {admins.map((admin) => (
          <div key={admin.id} className="rounded-lg border bg-white p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900">{admin.name}</p>
                  {currentUser?.id === admin.id && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500">@{admin.username}</p>
                <p className="text-sm text-slate-500 truncate">{admin.email}</p>
              </div>
              {currentUser?.id !== admin.id && (
                <AdminActions admin={admin} />
              )}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <Badge
                variant={admin.role === "super_admin" ? "default" : "secondary"}
                className="capitalize"
              >
                {admin.role.replace("_", " ")}
              </Badge>
              <span className="text-xs text-slate-500">
                {formatDate(admin.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
