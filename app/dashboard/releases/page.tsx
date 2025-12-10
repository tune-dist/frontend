'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
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
import { Button } from '@/components/ui/button'

import { Loader2, Plus, Filter, Eye, Trash2, Send, XCircle, Music, CheckCircle, UploadCloud, Ban } from 'lucide-react'
import { getReleases, deleteRelease, submitRelease, cancelRelease, approveRelease, rejectRelease, releaseRelease, Release, ReleaseStatus } from '@/lib/api/releases'

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

type StatusFilter = 'all' | ReleaseStatus

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchReleases = async () => {
    try {
      setLoading(true)
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      const response = await getReleases(params)
      console.log(response)
      setReleases(response.releases)
    } catch (error) {
      toast.error('Failed to fetch releases')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReleases()
  }, [statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Released':
        return 'bg-green-500/10 text-green-500'
      case 'Approved':
        return 'bg-purple-500/10 text-purple-500'
      case 'In Process':
        return 'bg-blue-500/10 text-blue-500'
      case 'Rejected':
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this release? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(id)
      await deleteRelease(id)
      toast.success('Release deleted successfully')
      fetchReleases()
    } catch (error) {
      toast.error('Failed to delete release')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSubmit = async (id: string) => {
    if (!confirm('Submit this release for review?')) {
      return
    }

    try {
      setActionLoading(id)
      await submitRelease(id)
      toast.success('Release submitted for review')
      fetchReleases()
    } catch (error) {
      toast.error('Failed to submit release')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this release submission?')) {
      return
    }

    try {
      setActionLoading(id)
      await cancelRelease(id)
      toast.success('Release submission cancelled')
      fetchReleases()
    } catch (error) {
      toast.error('Failed to cancel release')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this release?')) return
    try {
      setActionLoading(id)
      await approveRelease(id)
      toast.success('Release approved')
      fetchReleases()
    } catch (error) {
      toast.error('Failed to approve release')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      setActionLoading(id)
      await rejectRelease(id, reason)
      toast.success('Release rejected')
      fetchReleases()
    } catch (error) {
      toast.error('Failed to reject release')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRelease = async (id: string) => {
    if (!confirm('Mark this release as distributed/released?')) return
    try {
      setActionLoading(id)
      await releaseRelease(id)
      toast.success('Release marked as distributed')
      fetchReleases()
    } catch (error) {
      toast.error('Failed to release')
    } finally {
      setActionLoading(null)
    }
  }

  const statusFilters: { value: StatusFilter; label: string; count?: number }[] = [
    { value: 'all', label: 'All' },
    { value: 'In Process', label: 'In Process' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Released', label: 'Released' },
  ]

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              My <span className="animated-gradient">Releases</span>
            </h1>
            <p className="text-muted-foreground">
              Manage all your music releases in one place
            </p>
          </div>
          {user?.role !== 'release_manager' && (
            <Link href="/dashboard/upload">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                New Release
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filter by Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={statusFilter === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Releases Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    All Releases
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {releases.length} release{releases.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Type</TableHead>
                        {/* <TableHead>Release Date</TableHead> */}
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                            <div className="flex flex-col items-center gap-2">
                              <Music className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-lg font-medium">No releases found</p>
                              <p className="text-sm">Start by creating your first release</p>
                              {user?.role !== 'release_manager' && (
                                <Link href="/dashboard/upload" className="mt-4">
                                  <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Release
                                  </Button>
                                </Link>
                              )}
                            </div>
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
                            <TableCell>
                              <span className="text-sm capitalize">
                                {release.releaseType}
                              </span>
                            </TableCell>
                            {/* <TableCell className="text-muted-foreground">
                              {release.releaseDate
                                ? new Date(release.releaseDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                                : 'Not set'}
                            </TableCell> */}
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(release.status)}`}
                              >
                                {formatStatus(release.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* View button (always available) */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {/* Submit button (only for drafts - In Process without submittedAt) */}
                                {release.status === 'In Process' && !release.submittedAt && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSubmit(release._id)}
                                    disabled={actionLoading === release._id}
                                    title="Submit for review"
                                  >
                                    {actionLoading === release._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}

                                {/* Cancel button (for In Process with submittedAt) */}
                                {release.status === 'In Process' && release.submittedAt && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancel(release._id)}
                                    disabled={actionLoading === release._id}
                                    title="Cancel submission"
                                  >
                                    {actionLoading === release._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}

                                {/* Delete button (only for drafts - In Process without submittedAt) */}
                                {release.status === 'In Process' && !release.submittedAt && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(release._id)}
                                    disabled={actionLoading === release._id}
                                    title="Delete release"
                                    className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                  >
                                    {actionLoading === release._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                {/* Admin/Manager Actions */}
                                {(user?.role === 'release_manager' || user?.role === 'admin' || user?.role === 'super_admin') && (
                                  <>
                                    {/* Approve Button (Admin Only) */}
                                    {(user?.role === 'admin' || user?.role === 'super_admin') && release.status === 'In Process' && release.submittedAt && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleApprove(release._id)}
                                        disabled={actionLoading === release._id}
                                        title="Approve Release"
                                        className="text-purple-500 hover:text-purple-600 hover:bg-purple-500/10"
                                      >
                                        {actionLoading === release._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                      </Button>
                                    )}

                                    {/* Reject Button (Admin Only) */}
                                    {(user?.role === 'admin' || user?.role === 'super_admin') && release.status === 'In Process' && release.submittedAt && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleReject(release._id)}
                                        disabled={actionLoading === release._id}
                                        title="Reject Release"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                      >
                                        {actionLoading === release._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                                      </Button>
                                    )}

                                    {/* Release Button (Admins + Release Manager) */}
                                    {release.status === 'Approved' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRelease(release._id)}
                                        disabled={actionLoading === release._id}
                                        title="Mark as Distributed"
                                        className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                      >
                                        {actionLoading === release._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}

