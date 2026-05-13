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
import { Loader2, Plus, RefreshCcw, Search } from "lucide-react";
import toast from "react-hot-toast";
import {
    getPermissions,
    createPermission,
    Permission,
} from "@/lib/api/permissions";
import { getRoles, updateRole, Role } from "@/lib/api/roles";
import { getUsers, updateUserPermissions } from "@/lib/api/users";
import { User } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function PermissionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newPermission, setNewPermission] = useState({
        name: "",
        slug: "",
        description: "",
    });
    const [creating, setCreating] = useState(false);

    // User permissions state
    const [activeTab, setActiveTab] = useState("role");
    const [userSearch, setUserSearch] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("All");

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

    const fetchUsers = async () => {
        try {
            const usersData = await getUsers({
                search: userSearch || undefined,
                role: userRoleFilter !== "All" ? userRoleFilter : undefined,
                limit: 100,
            });
            setUsers(usersData.users || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch users");
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

    useEffect(() => {
        if (activeTab === "user") {
            fetchUsers();
        }
    }, [activeTab, userSearch, userRoleFilter]);

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

    const handleUserPermissionToggle = async (user: User, permissionSlug: string) => {
        const userPermissions = (user as any).permissions || [];
        const hasPermission = userPermissions.includes(permissionSlug);
        const newPermissions = hasPermission
            ? userPermissions.filter((p: string) => p !== permissionSlug)
            : [...userPermissions, permissionSlug];

        // Optimistic update
        setUsers((prevUsers) =>
            prevUsers.map((u) =>
                u._id === user._id ? { ...u, permissions: newPermissions } as any : u
            )
        );

        try {
            await updateUserPermissions(user._id, newPermissions);
            toast.success("User permissions updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update user permissions");
            // Revert on error
            fetchUsers();
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
                            Manage role-based and user-specific permissions.
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

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="role">Role</TabsTrigger>
                        <TabsTrigger value="user">User</TabsTrigger>
                    </TabsList>

                    <TabsContent value="role" className="mt-6">
                        <Card className="glass-card">
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
                    </TabsContent>

                    <TabsContent value="user" className="mt-6">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>User Permissions</CardTitle>
                                <CardDescription>
                                    Assign custom permissions to individual users. User permissions override role defaults.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search by name or email..."
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Filter by role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Roles</SelectItem>
                                                {roles.map((role) => (
                                                    <SelectItem key={role._id} value={role.name}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="sticky left-0 z-10 bg-background w-[250px]">User</TableHead>
                                                    <TableHead className="sticky left-[250px] z-10 bg-background w-[150px]">Role</TableHead>
                                                    {permissions.map((permission) => (
                                                        <TableHead key={permission._id} className="text-center">
                                                            <div className="min-w-[120px]">
                                                                <div className="text-xs">{permission.name}</div>
                                                            </div>
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user._id}>
                                                        <TableCell className="sticky left-0 z-10 bg-background font-medium">
                                                            <div>{user.fullName}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {user.email}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="sticky left-[250px] z-10 bg-background">
                                                            <span className="text-sm capitalize">{user.role}</span>
                                                        </TableCell>
                                                        {permissions.map((permission) => {
                                                            const userPermissions = (user as any).permissions || [];
                                                            return (
                                                                <TableCell key={`${user._id}-${permission._id}`} className="text-center">
                                                                    <div className="flex justify-center">
                                                                        <Switch
                                                                            checked={userPermissions.includes(permission.slug)}
                                                                            onCheckedChange={() =>
                                                                                handleUserPermissionToggle(user, permission.slug)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                            );
                                                        })}
                                                    </TableRow>
                                                ))}
                                                {users.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={permissions.length + 2} className="text-center py-8 text-muted-foreground">
                                                            No users found. Try adjusting your search or filters.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
