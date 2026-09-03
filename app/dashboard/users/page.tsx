'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Ban, MoreVertical, FileDown, Plus, Users, UserPlus, Clock, Flag, TrendingUp } from 'lucide-react';
import { canViewUsers, canManageUsers } from '@/lib/permissions';
import { getUsers, getUsersOverview, updateUserStatus } from '@/lib/api/users';
import { getAllPlans } from '@/lib/api/plans';
import { formatPlanDisplayName } from '@/lib/utils';
import { getUserAccountStatus, getUserStatusDotClass } from '@/lib/user-status';
import { getErrorMessage } from '@/lib/get-error-message';
import { PageSearchBar, PageSearchSection } from '@/components/dashboard/page-search-bar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function escapeCsvValue(value: string | number | null | undefined): string {
    const text = value == null ? '' : String(value);
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

function formatCsvDate(value?: string | Date | null): string {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
}

export default function UsersPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        pending: 0,
        flagged: 0,
        totalGrowthPercent: 0,
        newSignupsGrowthPercent: 0,
    });
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [planFilter, setPlanFilter] = useState('All');
    const [planOptions, setPlanOptions] = useState<{ key: string; title: string }[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        Promise.all([getAllPlans(), getUsersOverview()])
            .then(([plans, overview]) => {
                const planTitleByKey = new Map(
                    plans.map((plan) => [plan.key, plan.title]),
                );

                const mergedKeys = Array.from(
                    new Set([
                        ...overview.planKeys,
                        ...plans.map((plan) => plan.key),
                    ]),
                ).sort((a, b) => {
                    const labelA = planTitleByKey.get(a) || formatPlanDisplayName(a);
                    const labelB = planTitleByKey.get(b) || formatPlanDisplayName(b);
                    return labelA.localeCompare(labelB);
                });

                setPlanOptions(
                    mergedKeys.map((key) => ({
                        key,
                        title: planTitleByKey.get(key) || formatPlanDisplayName(key),
                    })),
                );

                setStats({
                    total: overview.stats.total,
                    new: overview.stats.newSignups24h,
                    pending: overview.stats.pendingApprovals,
                    flagged: overview.stats.flaggedAccounts,
                    totalGrowthPercent: overview.stats.totalGrowthPercent,
                    newSignupsGrowthPercent: overview.stats.newSignupsGrowthPercent,
                });
            })
            .catch((error) => {
                console.error('Failed to fetch users overview:', error);
            });
    }, []);

    // Redirect if unauthorized
    useEffect(() => {
        if (!authLoading && isMounted) {
            if (!currentUser || !canViewUsers(currentUser)) {
                router.push('/dashboard');
            }
        }
    }, [currentUser, authLoading, isMounted, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers({
                page,
                limit,
                search,
                role: roleFilter,
                status: statusFilter,
                plan: planFilter,
            });
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = (userId: string) => {
        router.push(`/dashboard/users/${userId}`);
    };

    const handleSuspendUser = async (userId: string, isSuspended: boolean, fullName?: string) => {
        const action = isSuspended ? 'unsuspend' : 'suspend';
        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${fullName || 'this user'}?`,
        );
        if (!confirmed) return;

        try {
            await updateUserStatus(userId, !isSuspended);
            toast.success(`User ${isSuspended ? 'unsuspended' : 'suspended'} successfully`);
            fetchUsers();
        } catch (error) {
            console.error(`Failed to ${action} user:`, error);
            toast.error(getErrorMessage(error, `Failed to ${action} user`));
        }
    };

    const handleExportCsv = async () => {
        setExporting(true);
        try {
            const filters = {
                search,
                role: roleFilter,
                status: statusFilter,
                plan: planFilter,
            };

            let data = await getUsers({
                page: 1,
                limit: Math.max(totalUsers, 1),
                ...filters,
            });

            // If filters changed since last list load, refetch with the true total.
            if ((data.total || 0) > (data.users?.length || 0)) {
                data = await getUsers({
                    page: 1,
                    limit: data.total,
                    ...filters,
                });
            }

            const exportUsers = data.users || [];

            if (exportUsers.length === 0) {
                toast.error('No users to export');
                return;
            }

            const headers = [
                'User Code',
                'Full Name',
                'Email',
                'Role',
                'Plan',
                'Status',
                'Email Verified',
                'Last Login',
                'Plan Start',
                'Plan End',
                'Created At',
            ];

            const rows = exportUsers.map((u: any) => [
                escapeCsvValue(u.userCode),
                escapeCsvValue(u.fullName),
                escapeCsvValue(u.email),
                escapeCsvValue(u.role),
                escapeCsvValue(formatPlanDisplayName(u.plan)),
                escapeCsvValue(getUserAccountStatus(u)),
                escapeCsvValue(u.isEmailVerified ? 'Yes' : 'No'),
                escapeCsvValue(formatCsvDate(u.lastLogin) || 'Never'),
                escapeCsvValue(formatCsvDate(u.planStartDate)),
                escapeCsvValue(formatCsvDate(u.planEndDate)),
                escapeCsvValue(formatCsvDate(u.createdAt)),
            ].join(','));

            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const dateStamp = new Date().toISOString().slice(0, 10);
            link.href = url;
            link.download = `users-export-${dateStamp}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success(`Exported ${exportUsers.length} user${exportUsers.length === 1 ? '' : 's'}`);
        } catch (error) {
            console.error('Failed to export users:', error);
            toast.error(getErrorMessage(error, 'Failed to export users'));
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        if (!authLoading && currentUser && canViewUsers(currentUser)) {
            const debounce = setTimeout(() => {
                fetchUsers();
            }, search ? 500 : 0);
            return () => clearTimeout(debounce);
        }
    }, [search, roleFilter, statusFilter, planFilter, page, authLoading, currentUser]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value);
        setPage(1);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const handlePlanFilterChange = (value: string) => {
        setPlanFilter(value);
        setPage(1);
    };


    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
            <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
                {/* ... content ... */}
                {/* Page Heading & Actions */}
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Overview</h1>
                        <p className="text-text-secondary text-base">Manage permissions, roles, and system access.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            disabled={exporting || loading || totalUsers === 0}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-highlight text-white hover:bg-surface-highlight transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <FileDown className="w-5 h-5" />
                            <span className="text-sm font-bold">{exporting ? 'Exporting...' : 'Export CSV'}</span>
                        </button>
                        <Link href="/auth"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background-dark hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(51,230,122,0.3)]">
                            <Plus className="w-5 h-5" />
                            <span className="text-sm font-bold">Add New User</span>
                        </Link>
                    </div>
                </div>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stat 1 */}
                    <div
                        className="flex flex-col gap-2 rounded-xl p-6 glass-card">
                        <div className="flex justify-between items-start">
                            <p className="text-text-secondary text-sm font-medium">Total Users</p>
                            <Users className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-white text-2xl font-bold">{stats.total.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-[#0bda43] text-sm font-medium">
                            <TrendingUp className="w-4 h-4" />
                            <span>{stats.totalGrowthPercent >= 0 ? '+' : ''}{stats.totalGrowthPercent}% vs last month</span>
                        </div>
                    </div>
                    {/* Stat 2 */}
                    <div
                        className="flex flex-col gap-2 rounded-xl p-6 glass-card">
                        <div className="flex justify-between items-start">
                            <p className="text-text-secondary text-sm font-medium">New Signups (24h)</p>
                            <UserPlus className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-white text-2xl font-bold">+{stats.new}</p>
                        <div className="flex items-center gap-1 text-[#0bda43] text-sm font-medium">
                            <TrendingUp className="w-4 h-4" />
                            <span>{stats.newSignupsGrowthPercent >= 0 ? '+' : ''}{stats.newSignupsGrowthPercent}% vs previous day</span>
                        </div>
                    </div>
                    {/* Stat 3 */}
                    <div
                        className="flex flex-col gap-2 rounded-xl p-6 glass-card">
                        <div className="flex justify-between items-start">
                            <p className="text-text-secondary text-sm font-medium">Pending Approvals</p>
                            <Clock className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-white text-2xl font-bold">{stats.pending}</p>
                        <div className="flex items-center gap-1 text-text-secondary text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            <span>Awaiting email verification</span>
                        </div>
                    </div>
                    {/* Stat 4 */}
                    <div
                        className="flex flex-col gap-2 rounded-xl p-6 border border-surface-highlight bg-surface-dark hover:border-primary/30 transition-colors group">
                        <div className="flex justify-between items-start">
                            <p className="text-text-secondary text-sm font-medium">Flagged Accounts</p>
                            <Flag className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <p className="text-white text-2xl font-bold">{stats.flagged}</p>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium">
                            <Flag className="w-4 h-4" />
                            <span>Suspended accounts</span>
                        </div>
                    </div>
                </div>
                {/* Command Bar: Search & Filter */}
                <PageSearchSection>
                    <div className="flex flex-col md:flex-row gap-2">
                        <PageSearchBar
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by ID, email, artist name, or label..."
                            className="flex-1"
                        />
                        {/* Filters */}
                        {isMounted ? (
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                <div className="w-[180px]">
                                    <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                                        <SelectTrigger className="w-full bg-surface-highlight border-none text-white h-[46px] rounded-xl">
                                            <SelectValue placeholder="Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">Role: All</SelectItem>
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="release_manager">Release Manager</SelectItem>
                                            <SelectItem value="artist">Artist</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-[180px]">
                                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                        <SelectTrigger className="w-full bg-surface-highlight border-none text-white h-[46px] rounded-xl">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">Status: All</SelectItem>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-[180px]">
                                    <Select value={planFilter} onValueChange={handlePlanFilterChange}>
                                        <SelectTrigger className="w-full bg-surface-highlight border-none text-white h-[46px] rounded-xl">
                                            <SelectValue placeholder="Plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">Plan: All</SelectItem>
                                            {planOptions.map((plan) => (
                                                <SelectItem key={plan.key} value={plan.key}>
                                                    {plan.title || formatPlanDisplayName(plan.key)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* <div className="relative group">
                                        <button
                                            className="flex items-center gap-2 px-4 py-3 bg-surface-highlight rounded-xl text-white hover:bg-surface-highlight/80 whitespace-nowrap text-sm font-medium transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">public</span>
                                            Region: Global
                                        </button>
                                    </div> */}
                            </div>
                        ) : (
                            <div className="flex gap-2 pb-2 md:pb-0">
                                <div className="w-[180px] h-[46px] bg-surface-highlight rounded-xl animate-pulse"></div>
                                <div className="w-[180px] h-[46px] bg-surface-highlight rounded-xl animate-pulse"></div>
                                <div className="w-[180px] h-[46px] bg-surface-highlight rounded-xl animate-pulse"></div>
                            </div>
                        )}
                    </div>
                </PageSearchSection>
                {/* Data Table */}
                <div className="rounded-2xl glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    className="border-b border-border/50 bg-surface-highlight/10 text-text-secondary text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">User Details</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Login</th>
                                    <th className="px-6 py-4 text-right">Revenue (YTD)</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-highlight text-sm text-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-text-secondary">Loading...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-text-secondary">No users found.</td>
                                    </tr>
                                ) : (
                                    users.map((listedUser) => (
                                        <tr key={listedUser._id} className="group hover:bg-surface-highlight/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {/* <div className="size-10 rounded-full bg-cover bg-center border border-surface-highlight"
                                                            style={{ backgroundImage: `url("${user.avatar || 'https://via.placeholder.com/40'}")` }}>
                                                        </div> */}
                                                    <img
                                                        src={listedUser.avatar || 'https://via.placeholder.com/40'}
                                                        alt={listedUser.fullName}
                                                        className="size-10 shrink-0 rounded-full object-cover border border-surface-highlight"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span
                                                            className="font-bold text-white group-hover:text-primary transition-colors">
                                                            {listedUser.fullName || 'Unknown User'}
                                                        </span>
                                                        <span className="text-text-secondary text-xs">{listedUser.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                    {listedUser.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/15 text-primary border border-primary/30">
                                                    {formatPlanDisplayName(listedUser.plan)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`size-2.5 rounded-full ${getUserStatusDotClass(listedUser)}`}></span>
                                                    <span className="text-white">{getUserAccountStatus(listedUser)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {listedUser.lastLogin ? new Date(listedUser.lastLogin).toLocaleDateString() : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">
                                                {/* Revenue placeholder */}
                                                $0.00
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            className="p-2 text-text-secondary hover:text-white hover:bg-surface-highlight rounded-lg transition-colors outline-none focus:outline-none ring-0 border-none">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem
                                                            onSelect={() => handleViewUser(listedUser._id)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Profile
                                                        </DropdownMenuItem>
                                                        {canManageUsers(currentUser) && listedUser._id !== currentUser?._id && (
                                                            <DropdownMenuItem
                                                                onSelect={() =>
                                                                    handleSuspendUser(
                                                                        listedUser._id,
                                                                        listedUser.isSuspended,
                                                                        listedUser.fullName,
                                                                    )
                                                                }
                                                                className={`cursor-pointer ${listedUser.isSuspended ? 'text-primary focus:text-primary' : 'text-red-500 focus:text-red-500'}`}
                                                            >
                                                                <Ban className="w-4 h-4 mr-2" />
                                                                {listedUser.isSuspended ? 'Unsuspend User' : 'Suspend User'}
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Footer */}
                    <div
                        className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-card/20 backdrop-blur-sm">
                        <p className="text-sm text-text-secondary">
                            Showing <span className="font-medium text-white">{(page - 1) * limit + 1}</span> to <span
                                className="font-medium text-white">{Math.min(page * limit, totalUsers)}</span> of <span
                                    className="font-medium text-white">{totalUsers}</span> results
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium text-white bg-surface-highlight rounded-lg hover:bg-surface-highlight/80 disabled:opacity-50 transition-colors">
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={page * limit >= totalUsers}
                                className="px-4 py-2 text-sm font-medium text-background-dark bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
