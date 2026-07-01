"use client";

import { useEffect, useState } from "react";
import PageLoading from "@/components/dashboard/page-loading";
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
import { Loader2, Plus, RefreshCcw, Lock } from "lucide-react";
import { PageSearchBar, PageSearchSection } from "@/components/dashboard/page-search-bar";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/get-error-message";
import {
    getPermissions,
    createPermission,
    Permission,
} from "@/lib/api/permissions";
import { getRoles, updateRole, Role } from "@/lib/api/roles";
import { getUsers, updateUserPermissions } from "@/lib/api/users";
import { User } from "@/lib/api/auth";
import { canManagePermissions, canViewPermissions } from "@/lib/permissions";
import { formatRoleLabel, formatPermissionLabel } from "@/lib/rbac-labels";
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
import { Badge } from "@/components/ui/badge";

type UserPermissionState = {
    fromRole: boolean;
    fromUser: boolean;
    effective: boolean;
};

function getUserPermissionState(
    user: User,
    permissionSlug: string,
    roles: Role[],
): UserPermissionState {
    const roleDef = roles.find((r) => r.name === user.role);
    const fromRole = roleDef?.permissions.includes(permissionSlug) ?? false;
    const fromUser = (user.permissions ?? []).includes(permissionSlug);
    return { fromRole, fromUser, effective: fromRole || fromUser };
}

export default function PermissionsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const canManage = canManagePermissions(user);
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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});

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
            toast.error(getErrorMessage(error, "Failed to fetch data"));
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const [permsData, rolesData] = await Promise.all([
                getPermissions(),
                getRoles(),
            ]);
            setPermissions(permsData);
            setRoles(rolesData);
            toast.success("Permissions refreshed");
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Failed to refresh data"));
        } finally {
            setIsRefreshing(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const usersData = await getUsers({
                search: userSearch || undefined,
                role: userRoleFilter !== "All" ? userRoleFilter : undefined,
                limit: 100,
            });
            setUsers(usersData.users || []);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Failed to fetch users"));
        } finally {
            setUsersLoading(false);
        }
    };

    // Redirect if unauthorized
    useEffect(() => {
        if (!authLoading && user) {
            if (!canViewPermissions(user)) {
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
        if (!canManage) return;
        const toggleKey = `role-${role._id}-${permissionSlug}`;
        if (pendingToggles[toggleKey]) return;

        const hasPermission = role.permissions.includes(permissionSlug);
        const newPermissions = hasPermission
            ? role.permissions.filter((p) => p !== permissionSlug)
            : [...role.permissions, permissionSlug];

        setRoles((prevRoles) =>
            prevRoles.map((r) =>
                r._id === role._id ? { ...r, permissions: newPermissions } : r
            )
        );

        setPendingToggles((prev) => ({ ...prev, [toggleKey]: true }));
        try {
            await updateRole(role._id, { permissions: newPermissions });
            toast.success("Permissions updated");
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Failed to update permissions"));
            fetchData();
        } finally {
            setPendingToggles((prev) => ({ ...prev, [toggleKey]: false }));
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
            toast.error(getErrorMessage(error, "Failed to create permission"));
        } finally {
            setCreating(false);
        }
    };

    const handleUserPermissionToggle = async (user: User, permissionSlug: string) => {
        if (!canManage) return;
        const toggleKey = `user-${user._id}-${permissionSlug}`;
        if (pendingToggles[toggleKey]) return;

        const userPermissions = user.permissions ?? [];
        const hasPermission = userPermissions.includes(permissionSlug);
        const newPermissions = hasPermission
            ? userPermissions.filter((p: string) => p !== permissionSlug)
            : [...userPermissions, permissionSlug];

        setUsers((prevUsers) =>
            prevUsers.map((u) =>
                u._id === user._id ? { ...u, permissions: newPermissions } : u
            )
        );

        setPendingToggles((prev) => ({ ...prev, [toggleKey]: true }));
        try {
            await updateUserPermissions(user._id, newPermissions);
            toast.success("User permissions updated");
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Failed to update user permissions"));
            fetchUsers();
        } finally {
            setPendingToggles((prev) => ({ ...prev, [toggleKey]: false }));
        }
    };

    if (loading) {
        return <PageLoading />;
    }

    return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Permissions Matrix</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage role-based and user-specific permissions.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
                            {isRefreshing ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCcw className="h-4 w-4 mr-2" />
                            )}
                            Refresh
                        </Button>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            {canManage && (
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Permission
                                </Button>
                            </DialogTrigger>
                            )}
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
                                                    <TableHead key={role._id} className="text-center min-w-[120px]">
                                                        {formatRoleLabel(role.name)}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {permissions.map((permission) => (
                                                <TableRow key={permission._id}>
                                                    <TableCell className="font-medium">
                                                        {formatPermissionLabel(permission)}
                                                    </TableCell>
                                                    {roles.map((role) => {
                                                        const toggleKey = `role-${role._id}-${permission.slug}`;
                                                        return (
                                                        <TableCell key={`${role._id}-${permission._id}`} className="text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                {pendingToggles[toggleKey] ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                ) : (
                                                                <>
                                                                <Switch
                                                                    checked={role.permissions.includes(permission.slug)}
                                                                    disabled={!canManage}
                                                                    onCheckedChange={() =>
                                                                        handleToggle(role, permission.slug)
                                                                    }
                                                                />
                                                                <span className={role.permissions.includes(permission.slug) ? "text-[10px] font-medium text-primary" : "text-[10px] text-muted-foreground"}>
                                                                    {role.permissions.includes(permission.slug) ? "ON" : "OFF"}
                                                                </span>
                                                                </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        );
                                                    })}
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
                                    Extra permissions on top of role defaults. Role permissions show as locked — use the Role tab to change those.
                                </CardDescription>
                                <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Badge variant="secondary" className="gap-1 px-2 py-0 text-[10px] font-normal">
                                            <Lock className="h-3 w-3" /> Role
                                        </Badge>
                                        from role (not editable here)
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Switch checked disabled className="scale-75 pointer-events-none" />
                                        ON = extra permission for this user
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Switch checked={false} disabled className="scale-75 pointer-events-none" />
                                        OFF = no access (unless role grants it)
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <PageSearchSection>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <PageSearchBar
                                                value={userSearch}
                                                onChange={setUserSearch}
                                                placeholder="Search by name or email..."
                                                className="flex-1"
                                            />
                                            <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                                                <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl bg-secondary border-border">
                                                    <SelectValue placeholder="Filter by role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All">All Roles</SelectItem>
                                                    {roles.map((role) => (
                                                        <SelectItem key={role._id} value={role.name}>
                                                            {formatRoleLabel(role.name)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </PageSearchSection>

                                    <div className="overflow-x-auto relative">
                                        {usersLoading && (
                                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            </div>
                                        )}
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="sticky left-0 z-10 bg-background w-[250px]">User</TableHead>
                                                    <TableHead className="sticky left-[250px] z-10 bg-background w-[150px]">Role</TableHead>
                                                    {permissions.map((permission) => (
                                                        <TableHead key={permission._id} className="text-center">
                                                            <div className="min-w-[120px]">
                                                                <div className="text-xs">{formatPermissionLabel(permission)}</div>
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
                                                            <span className="text-sm">{formatRoleLabel(user.role)}</span>
                                                        </TableCell>
                                                        {permissions.map((permission) => {
                                                            const state = getUserPermissionState(user, permission.slug, roles);
                                                            const toggleKey = `user-${user._id}-${permission.slug}`;
                                                            return (
                                                                <TableCell key={`${user._id}-${permission._id}`} className="text-center">
                                                                    <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                                                        {pendingToggles[toggleKey] ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                        ) : state.fromRole ? (
                                                                            <Badge
                                                                                variant="secondary"
                                                                                className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                                                                title="Granted by role — edit on Role tab"
                                                                            >
                                                                                <Lock className="h-3 w-3" />
                                                                                Role
                                                                            </Badge>
                                                                        ) : (
                                                                            <>
                                                                                <Switch
                                                                                    checked={state.fromUser}
                                                                                    disabled={!canManage}
                                                                                    onCheckedChange={() =>
                                                                                        handleUserPermissionToggle(user, permission.slug)
                                                                                    }
                                                                                    aria-label={`${formatPermissionLabel(permission)} for ${user.fullName}`}
                                                                                />
                                                                                <span className={state.fromUser ? "text-[10px] font-medium text-primary" : "text-[10px] text-muted-foreground"}>
                                                                                    {state.fromUser ? "Extra · ON" : "OFF"}
                                                                                </span>
                                                                            </>
                                                                        )}
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
    );
}
