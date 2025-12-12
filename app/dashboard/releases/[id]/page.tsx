'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Music, User, Globe, Disc, FileAudio, Loader2 } from 'lucide-react'
import { getRelease, Release, TrackPayload } from '@/lib/api/releases'
import DashboardLayout from '@/components/dashboard/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ReleaseDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [release, setRelease] = useState<Release | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRelease = async () => {
            try {
                if (!params.id) return
                const data = await getRelease(params.id as string)
                setRelease(data)
            } catch (err: any) {
                console.error('Error fetching release:', err)
                setError(err.message || 'Failed to load release details')
            } finally {
                setLoading(false)
            }
        }

        fetchRelease()
    }, [params.id])

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

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading release details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !release) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Release</h2>
                    <p className="text-muted-foreground mb-6">{error || 'Release not found'}</p>
                    <Button onClick={() => router.push('/dashboard/releases')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Releases
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    // Cast to any to access potential extra fields not in interface
    const releaseAny = release as any;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/releases">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {release.title}
                            <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${getStatusColor(release.status)}`}>
                                {formatStatus(release.status)}
                            </span>
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <User className="h-4 w-4" /> {release.artistName}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Cover Art & Quick Stats */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="aspect-square relative rounded-lg overflow-hidden border border-border bg-muted/30 flex items-center justify-center">
                                    {release.coverArt ? (
                                        <img
                                            src={release.coverArt.url}
                                            alt={`${release.title} Cover Art`}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <Music className="h-16 w-16 mb-2 opacity-50" />
                                            <span>No Cover Art</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Release Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Disc className="h-4 w-4" /> Type
                                    </span>
                                    <span className="capitalize font-medium">{release.releaseType}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Globe className="h-4 w-4" /> Language
                                    </span>
                                    <span className="font-medium">{release.language}</span>
                                </div>
                                {release.releaseDate && (
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-4 w-4" /> Release Date
                                        </span>
                                        <span className="font-medium">
                                            {new Date(release.releaseDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {release.labelName && (
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Label</span>
                                        <span className="font-medium">{release.labelName}</span>
                                    </div>
                                )}
                                {release.barcode && (
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Barcode</span>
                                        <span className="font-medium">{release.barcode}</span>
                                    </div>
                                )}
                                {release.catalogNumber && (
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Catalog #</span>
                                        <span className="font-medium">{release.catalogNumber}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Tracks & Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Tracks Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileAudio className="h-5 w-5" />
                                    Tracks
                                </CardTitle>
                                <CardDescription>
                                    {release.tracks?.length || (release.audioFile ? 1 : 0)} track(s) in this release
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Single Track Release (Legacy/Simple structure) */}
                                    {release.releaseType === 'single' && release.audioFile && (!release.tracks || release.tracks.length === 0) && (
                                        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    1
                                                </div>
                                                <div>
                                                    <p className="font-medium">{release.title}</p>
                                                    <p className="text-xs text-muted-foreground">{release.artistName}</p>
                                                </div>
                                            </div>
                                            <a
                                                href={release.audioFile.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3"
                                            >
                                                Play / Download
                                            </a>
                                        </div>
                                    )}

                                    {/* Multi-track Release */}
                                    {release.tracks && release.tracks.length > 0 && (
                                        <div className="space-y-2">
                                            {release.tracks.map((track: TrackPayload, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{track.title}</p>
                                                            <p className="text-xs text-muted-foreground">{track.artistName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {track.isExplicit && <span className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-1 text-[10px]">E</span>}
                                                        {track.audioFile && (
                                                            <a
                                                                href={track.audioFile.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3"
                                                            >
                                                                Download
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Distribution Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Genres</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {releaseAny.primaryGenre && <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">{releaseAny.primaryGenre}</span>}
                                        {releaseAny.secondaryGenre && <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">{releaseAny.secondaryGenre}</span>}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Copyrights</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-muted-foreground mr-2">©</span> {release.copyright || 'N/A'}</p>
                                        <p><span className="text-muted-foreground mr-2">℗</span> {release.publisher || 'N/A'}</p>
                                    </div>
                                </div>

                                {release.rejectionReason && release.status === 'Rejected' && (
                                    <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                        <h4 className="text-red-500 font-semibold mb-1 flex items-center gap-2">
                                            Rejection Reason
                                        </h4>
                                        <p className="text-sm text-red-600/90 dark:text-red-400">
                                            {release.rejectionReason}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
