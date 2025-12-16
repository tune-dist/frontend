'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, Ban, MoreVertical, Search, FileDown, Plus, Users, UserPlus, Clock, Flag, TrendingUp, TrendingDown } from 'lucide-react';
import { getUsers } from '@/lib/api/users';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
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

export default function UsersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 145203,
        new: 842,
        pending: 45, // API doesn't provide this yet
        flagged: 112 // API doesn't provide this yet
    });
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Redirect if not super_admin
    useEffect(() => {
        if (!authLoading && isMounted) {
            if (!user || user.role !== 'super_admin') {
                router.push('/dashboard');
            }
        }
    }, [user, authLoading, isMounted, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers({
                page,
                limit,
                search,
                role: roleFilter,
                status: statusFilter
            });
            setUsers(data.users || []); // Handle backend response structure
            setTotalUsers(data.total || 0);

            // If backend returns stats, update them here
            if (data.total) {
                setStats(prev => ({ ...prev, total: data.total }));
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = (userId: string) => {
        // Implement navigation to user profile
        console.log('View user:', userId);
    };

    const handleSuspendUser = async (userId: string) => {
        // Implement suspend logic
        console.log('Suspend user:', userId);
        // Add toast notification here
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(debounce);
    }, [search, roleFilter, statusFilter, page]);


    return (
        <DashboardLayout>
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
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-highlight text-white hover:bg-surface-highlight transition-colors">
                                <FileDown className="w-5 h-5" />
                                <span className="text-sm font-bold">Export CSV</span>
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
                            className="flex flex-col gap-2 rounded-xl p-6 border border-surface-highlight bg-surface-dark hover:border-primary/30 transition-colors group">
                            <div className="flex justify-between items-start">
                                <p className="text-text-secondary text-sm font-medium">Total Users</p>
                                <Users className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-white text-2xl font-bold">{stats.total.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-[#0bda43] text-sm font-medium">
                                <TrendingUp className="w-4 h-4" />
                                <span>+12% vs last month</span>
                            </div>
                        </div>
                        {/* Stat 2 */}
                        <div
                            className="flex flex-col gap-2 rounded-xl p-6 border border-surface-highlight bg-surface-dark hover:border-primary/30 transition-colors group">
                            <div className="flex justify-between items-start">
                                <p className="text-text-secondary text-sm font-medium">New Signups (24h)</p>
                                <UserPlus className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-white text-2xl font-bold">+{stats.new}</p>
                            <div className="flex items-center gap-1 text-[#0bda43] text-sm font-medium">
                                <TrendingUp className="w-4 h-4" />
                                <span>+5% growth rate</span>
                            </div>
                        </div>
                        {/* Stat 3 */}
                        <div
                            className="flex flex-col gap-2 rounded-xl p-6 border border-surface-highlight bg-surface-dark hover:border-primary/30 transition-colors group">
                            <div className="flex justify-between items-start">
                                <p className="text-text-secondary text-sm font-medium">Pending Approvals</p>
                                <Clock className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-white text-2xl font-bold">{stats.pending}</p>
                            <div className="flex items-center gap-1 text-[#fa5538] text-sm font-medium">
                                <TrendingDown className="w-4 h-4" />
                                <span>-2% processing time</span>
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
                                <span>Requires Attention</span>
                            </div>
                        </div>
                    </div>
                    {/* Command Bar: Search & Filter */}
                    <div className="bg-surface-dark rounded-2xl border border-surface-highlight p-2">
                        <div className="flex flex-col md:flex-row gap-2">
                            {/* Search */}
                            <div className="flex-1 relative">
                                {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-text-secondary">search</span>
                                </div> */}
                                <input
                                    className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all sm:text-sm"
                                    placeholder="Search by ID, email, artist name, or label..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            {/* Filters */}
                            {isMounted ? (
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                    <div className="w-[180px]">
                                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                                            <SelectTrigger className="w-full bg-surface-highlight border-none text-white h-[46px] rounded-xl">
                                                <SelectValue placeholder="Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">Role: All</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="release_manager">Release Manager</SelectItem>
                                                <SelectItem value="artist">Artist</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-[180px]">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full bg-surface-highlight border-none text-white h-[46px] rounded-xl">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">Status: All</SelectItem>
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Suspended">Suspended</SelectItem>
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
                                    <div className="w-[150px] h-[46px] bg-surface-highlight rounded-xl animate-pulse"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Data Table */}
                    <div className="rounded-2xl border border-surface-highlight bg-surface-dark overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr
                                        className="border-b border-surface-highlight bg-surface-highlight/20 text-text-secondary text-xs uppercase tracking-wider font-semibold">
                                        <th className="px-6 py-4">User Details</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Last Login</th>
                                        <th className="px-6 py-4 text-right">Revenue (YTD)</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-highlight text-sm text-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-text-secondary">Loading...</td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8 text-text-secondary">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user._id} className="group hover:bg-surface-highlight/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-full bg-cover bg-center border border-surface-highlight"
                                                            style={{ backgroundImage: `url("${user.avatarUrl || 'https://via.placeholder.com/40'}")` }}>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span
                                                                className="font-bold text-white group-hover:text-primary transition-colors">
                                                                {user.fullName || 'Unknown User'}
                                                            </span>
                                                            <span className="text-text-secondary text-xs">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`size-2.5 rounded-full ${user.isEmailVerified ? 'bg-primary shadow-[0_0_8px_rgba(51,230,122,0.6)]' : 'bg-yellow-500'}`}></span>
                                                        <span className="text-white">{user.isEmailVerified ? 'Active' : 'Pending'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
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
                                                            <DropdownMenuItem onClick={() => handleViewUser(user._id)} className="cursor-pointer">
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSuspendUser(user._id)} className="text-red-500 focus:text-red-500 cursor-pointer">
                                                                <Ban className="w-4 h-4 mr-2" />
                                                                Suspend User
                                                            </DropdownMenuItem>
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
                            className="flex items-center justify-between px-6 py-4 border-t border-surface-highlight bg-surface-dark">
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
        </DashboardLayout>
    );
}
