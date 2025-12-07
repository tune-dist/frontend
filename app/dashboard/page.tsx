'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TrendingUp, DollarSign, Globe, Music, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getReleases, Release } from '@/lib/api/releases'
import { getUsageStats, UsageStats } from '@/lib/api/users'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [releases, setReleases] = useState<Release[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [releasesData, statsData] = await Promise.all([
          getReleases({ limit: 5 }),
          getUsageStats(),
        ])
        setReleases(releasesData.releases)
        setUsageStats(statsData)
      } catch (error) {
        toast.error('Failed to fetch dashboard data')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'distributed':
        return 'bg-green-500/10 text-green-500'
      case 'processing':
        return 'bg-blue-500/10 text-blue-500'
      case 'pending_review':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'rejected':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="animated-gradient">{user?.fullName}!</span>
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your music today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Releases
                </CardTitle>
                <Music className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats?.releases.total || 0}</div>
                <CardDescription className="mt-1">
                  {usageStats?.releases.used || 0} this month
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats?.storage.usedFormatted || '0 MB'}</div>
                <CardDescription className="mt-1">
                  {usageStats?.plan && `${usageStats.plan.charAt(0).toUpperCase() + usageStats.plan.slice(1)} Plan`}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Can Upload
                </CardTitle>
                <Globe className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageStats?.releases.canUpload ? 'Yes' : 'No'}
                </div>
                <CardDescription className="mt-1">
                  {usageStats?.releases.limit === 0
                    ? 'Unlimited releases'
                    : `${usageStats?.releases.limit} release${usageStats?.releases.limit > 1 ? 's' : ''} limit`
                  }
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Releases Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Recent Releases
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your latest music releases and their status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Release Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {releases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No releases yet. Start by uploading your first track!
                        </TableCell>
                      </TableRow>
                    ) : (
                      releases.map((release) => (
                        <TableRow key={release._id}>
                          <TableCell className="font-medium">
                            {release.title}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {release.artistName}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(release.releaseDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(release.status)}`}
                            >
                              {formatStatus(release.status)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
