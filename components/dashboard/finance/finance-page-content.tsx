'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  Banknote,
  Navigation,
  CheckCircle2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function FinancePageContent() {
  const transactions = [
    {
      id: '1',
      date: 'Oct 24, 2023',
      description: 'Streaming Royalties - September',
      subDescription: 'Spotify, Apple Music, Tidal',
      type: 'Earnings',
      status: 'Completed',
      amount: 428.0,
      isPositive: true,
    },
    {
      id: '2',
      date: 'Oct 01, 2023',
      description: 'Withdrawal to Chase Bank',
      subDescription: 'Ref: #WT-992831',
      type: 'Payout',
      status: 'Completed',
      amount: -892.4,
      isPositive: false,
    },
    {
      id: '3',
      date: 'Sep 28, 2023',
      description: 'Sync License - "Neon Dreams"',
      subDescription: 'Indie Film Placement',
      type: 'License',
      status: 'Completed',
      amount: 115.0,
      isPositive: true,
    },
  ]

  const payoutMethods = [
    {
      id: '1',
      name: 'Chase Bank',
      details: 'Checking •••• 8821',
      status: 'active',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 lg:p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold tracking-tight">Artist Wallet</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="h-10 border-border/80 bg-card/50 pl-10"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 border-border/80">
            <div className="relative">
              <Badge className="absolute -right-1 -top-1 h-2 w-2 border-0 bg-primary p-0" />
              <Navigation className="h-4 w-4" />
            </div>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-border/80 bg-[#0d141e] transition-all duration-300 hover:border-primary/30 lg:col-span-2">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 opacity-20 blur-3xl" />
          <CardContent className="relative z-10 flex h-full min-h-[250px] flex-col justify-between p-8">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Total Available Balance
              </p>
              <div className="mb-6 text-5xl font-black">$1,240.50</div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Button className="rounded-xl bg-primary px-8 py-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
                <Banknote className="mr-2 h-5 w-5" />
                Withdraw Funds
              </Button>
              <p className="text-sm text-muted-foreground">
                Next automatic payout:{' '}
                <span className="font-semibold text-foreground">Nov 01, 2023</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-green-500/20 bg-green-500/5 text-green-500">
                Success
              </Badge>
            </div>
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Last Payout</p>
              <h3 className="mb-2 text-2xl font-bold">$892.40</h3>
              <p className="text-xs text-muted-foreground">Sent on Oct 01, 2023</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Payout Methods</h2>
          <Button variant="link" className="p-0 font-semibold text-primary">
            Manage
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {payoutMethods.map((method) => (
            <Card key={method.id} className="glass-card group relative overflow-hidden">
              <div className="absolute right-2 top-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 font-bold">{method.name}</h3>
                <p className="text-sm text-muted-foreground">{method.details}</p>
              </CardContent>
            </Card>
          ))}

          <button className="group flex h-full min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 p-6 transition-colors hover:bg-card/50">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-border/50 transition-colors group-hover:border-primary">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">
              Add New Method
            </p>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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

        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {transactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    className="group transition-colors hover:bg-card/40"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <td className="px-6 py-5 align-top">
                      <span className="text-sm font-medium">{tx.date}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold transition-colors group-hover:text-primary">
                          {tx.description}
                        </span>
                        <span className="mt-0.5 text-xs text-muted-foreground">{tx.subDescription}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center align-top">
                      <Badge
                        variant="secondary"
                        className="border-border/50 bg-card py-0.5 text-[10px] font-bold"
                      >
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
                      <span
                        className={cn(
                          'text-sm font-black',
                          tx.isPositive ? 'text-green-500' : 'text-red-500',
                        )}
                      >
                        {tx.isPositive ? '+' : ''}$
                        {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border/50 p-4 text-center">
            <button className="text-xs font-bold text-primary hover:underline">
              View All Transactions
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
