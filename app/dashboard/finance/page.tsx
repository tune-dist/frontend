'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    Download,
    MoreVertical,
    Banknote,
    Navigation,
    CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState('all');

    const transactions = [
        {
            id: '1',
            date: 'Oct 24, 2023',
            description: 'Streaming Royalties - September',
            subDescription: 'Spotify, Apple Music, Tidal',
            type: 'Earnings',
            status: 'Completed',
            amount: 428.00,
            isPositive: true,
        },
        {
            id: '2',
            date: 'Oct 01, 2023',
            description: 'Withdrawal to Chase Bank',
            subDescription: 'Ref: #WT-992831',
            type: 'Payout',
            status: 'Completed',
            amount: -892.40,
            isPositive: false,
        },
        {
            id: '3',
            date: 'Sep 28, 2023',
            description: 'Sync License - "Neon Dreams"',
            subDescription: 'Indie Film Placement',
            type: 'License',
            status: 'Completed',
            amount: 115.00,
            isPositive: true,
        },
    ];

    const payoutMethods = [
        {
            id: '1',
            name: 'Chase Bank',
            details: 'Checking •••• 8821',
            status: 'active',
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 p-4 lg:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Artist Wallet</h1>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
                                className="pl-10 h-10 bg-card/50 border-border/50"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="h-10 w-10 border-border/50">
                            <div className="relative">
                                <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-primary border-0" />
                                <Navigation className="h-4 w-4" />
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Main Stats and Payout Methods */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Balance Card */}
                    <Card className="lg:col-span-2 bg-[#0d141e] border-border/50 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-20" />
                        <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[250px]">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-4">
                                    Total Available Balance
                                </p>
                                <div className="text-5xl font-black mb-6">
                                    $1,240.50
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6">
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 rounded-xl shadow-lg shadow-primary/20">
                                    <Banknote className="h-5 w-5 mr-2" />
                                    Withdraw Funds
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Next automatic payout: <span className="text-foreground font-semibold">Nov 01, 2023</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Last Payout */}
                    <Card className="bg-card/50 border-border/50">
                        <CardContent className="p-6 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <Badge variant="outline" className="border-green-500/20 text-green-500 bg-green-500/5">
                                    Success
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Last Payout</p>
                                <h3 className="text-2xl font-bold mb-2">$892.40</h3>
                                <p className="text-xs text-muted-foreground">Sent on Oct 01, 2023</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payout Methods Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Payout Methods</h2>
                        <Button variant="link" className="text-primary font-semibold p-0">Manage</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {payoutMethods.map((method) => (
                            <Card key={method.id} className="bg-card/30 border-primary/20 relative group overflow-hidden">
                                <div className="absolute top-2 right-2">
                                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                        <Wallet className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="font-bold mb-1">{method.name}</h3>
                                    <p className="text-sm text-muted-foreground">{method.details}</p>
                                </CardContent>
                            </Card>
                        ))}

                        <button className="border-2 border-dashed border-border/50 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-card/50 transition-colors group h-full min-h-[160px]">
                            <div className="h-10 w-10 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center mb-3 group-hover:border-primary transition-colors">
                                <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">Add New Method</p>
                        </button>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold">Recent Transactions</h2>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-border/50 bg-card/50">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 gap-2 border-border/50 bg-card/50">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>

                    <Card className="border-border/50 overflow-hidden bg-card/20 backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/30">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Type</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {transactions.map((tx) => (
                                        <motion.tr
                                            key={tx.id}
                                            className="hover:bg-card/40 transition-colors group"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <td className="px-6 py-5 align-top">
                                                <span className="text-sm font-medium">{tx.date}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{tx.description}</span>
                                                    <span className="text-xs text-muted-foreground mt-0.5">{tx.subDescription}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center align-top">
                                                <Badge variant="secondary" className="bg-card border-border/50 text-[10px] font-bold py-0.5">
                                                    {tx.type}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5 text-center align-top">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                    <span className="text-xs font-medium text-green-500">{tx.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right align-top">
                                                <span className={cn(
                                                    "text-sm font-black",
                                                    tx.isPositive ? "text-green-500" : "text-red-500"
                                                )}>
                                                    {tx.isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-border/50 text-center">
                            <button className="text-xs font-bold text-primary hover:underline">View All Transactions</button>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
