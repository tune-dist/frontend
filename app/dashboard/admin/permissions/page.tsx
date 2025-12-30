"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import {
    getPermissions,
    createPermission,
    Permission,
} from "@/lib/api/permissions";
import { getRoles, updateRole, Role } from "@/lib/api/roles";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function PermissionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newPermission, setNewPermission] = useState({
        name: "",
        slug: "",
        description: "",
    });
    const [creating, setCreating] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [permsData, rolesData] = await Promise.all([
                getPermissions(),
                getRoles(),
            ]);
            setPermissions(permsData);
            setRoles(rolesData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    // Redirect if unauthorized
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role !== "super_admin" && !user.permissions?.includes("MANAGE_PERMISSIONS")) {
                router.push("/dashboard");
            }
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggle = async (role: Role, permissionSlug: string) => {
        const hasPermission = role.permissions.includes(permissionSlug);
        const newPermissions = hasPermission
            ? role.permissions.filter((p) => p !== permissionSlug)
            : [...role.permissions, permissionSlug];

        // Optimistic update
        setRoles((prevRoles) =>
            prevRoles.map((r) =>
                r._id === role._id ? { ...r, permissions: newPermissions } : r
            )
        );

        try {
            await updateRole(role._id, { permissions: newPermissions });
            toast.success("Permissions updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update permissions");
            // Revert on error
            fetchData();
        }
    };

    const handleCreate = async () => {
        if (!newPermission.name || !newPermission.slug) {
            toast.error("Name and Slug are required");
            return;
        }
        setCreating(true);
        try {
            await createPermission(newPermission);
            toast.success("Permission created");
            setIsCreateDialogOpen(false);
            setNewPermission({ name: "", slug: "", description: "" });
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create permission");
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Permissions Matrix</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage role-based permissions efficiently.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={fetchData}>
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Permission
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Permission</DialogTitle>
                                    <DialogDescription>
                                        Add a new permission to the system.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newPermission.name}
                                            onChange={(e) =>
                                                setNewPermission({ ...newPermission, name: e.target.value })
                                            }
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="slug" className="text-right">
                                            Slug
                                        </Label>
                                        <Input
                                            id="slug"
                                            value={newPermission.slug}
                                            onChange={(e) =>
                                                setNewPermission({
                                                    ...newPermission,
                                                    slug: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                                                })
                                            }
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="description" className="text-right">
                                            Description
                                        </Label>
                                        <Input
                                            id="description"
                                            value={newPermission.description}
                                            onChange={(e) =>
                                                setNewPermission({
                                                    ...newPermission,
                                                    description: e.target.value,
                                                })
                                            }
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCreateDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreate} disabled={creating}>
                                        {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                        <CardDescription>
                            Toggle permissions for each role. Changes are saved automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Permission</TableHead>
                                        {roles.map((role) => (
                                            <TableHead key={role._id} className="text-center">
                                                {role.name}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.map((permission) => (
                                        <TableRow key={permission._id}>
                                            <TableCell className="font-medium">
                                                <div>{permission.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {permission.slug}
                                                </div>
                                            </TableCell>
                                            {roles.map((role) => (
                                                <TableCell key={`${role._id}-${permission._id}`} className="text-center">
                                                    <div className="flex justify-center">
                                                        <Switch
                                                            checked={role.permissions.includes(permission.slug)}
                                                            onCheckedChange={() =>
                                                                handleToggle(role, permission.slug)
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                    {permissions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={roles.length + 1} className="text-center py-8 text-muted-foreground">
                                                No permissions found. Create one to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
