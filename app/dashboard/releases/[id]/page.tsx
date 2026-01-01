"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Music,
  User,
  Globe,
  Disc,
  FileAudio,
  Loader2,
} from "lucide-react";
import { getRelease, Release, TrackPayload } from "@/lib/api/releases";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { S3Image } from "@/components/ui/s3-image";

export default function ReleaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        if (!params.id) return;
        const data = await getRelease(params.id as string);
        setRelease(data);
      } catch (err: any) {
        console.error("Error fetching release:", err);
        setError(err.message || "Failed to load release details");
      } finally {
        setLoading(false);
      }
    };

    fetchRelease();
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Released":
        return "bg-green-500/10 text-green-500";
      case "Approved":
        return "bg-purple-500/10 text-purple-500";
      case "In Process":
        return "bg-blue-500/10 text-blue-500";
      case "Rejected":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading release details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !release) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Error Loading Release
          </h2>
          <p className="text-muted-foreground mb-6">
            {error || "Release not found"}
          </p>
          <Button onClick={() => router.push("/dashboard/releases")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Releases
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Cast to any to access potential extra fields not in interface
  const releaseAny = release as any;

  return (
    <DashboardLayout>
      <div className="space-y-3 max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/releases">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {release.title}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                  release.status
                )}`}
              >
                {formatStatus(release.status)}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> {release.artistName}
            </p>
          </div>
        </div>

        {/* Release Info - Full Width */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">Release Info</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              <div className="flex flex-col items-center p-2 rounded-md border border-border/50 bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Disc className="h-3 w-3" /> Type
                </span>
                <span className="capitalize font-medium">
                  {release.releaseType}
                </span>
              </div>

              <div className="flex flex-col items-center p-2 rounded-md border border-border/50 bg-card">
                <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                  <Globe className="h-3 w-3" /> Language
                </span>
                <span className="font-medium">{release.language}</span>
              </div>

              {release.releaseDate && (
                <div className="flex flex-col items-center p-2 rounded-md border border-border/50 bg-card">
                  <span className="text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3 w-3" /> Date
                  </span>
                  <span className="font-medium text-center">
                    {new Date(release.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {release.labelName && (
                <div className="flex flex-col items-center p-2 rounded-md border border-border/50 bg-card">
                  <span className="text-muted-foreground mb-1">Label</span>
                  <span className="font-medium truncate max-w-full">{release.labelName}</span>
                </div>
              )}

              <div className="flex flex-col items-center p-2 rounded-md border border-border/50 bg-card">
                <span className="text-muted-foreground mb-1">UPC / ISRC</span>
                <div className="flex flex-col items-center text-[10px] font-medium leading-tight">
                  <span className="whitespace-nowrap">UPC: {release.barcode || "-"}</span>
                  <span className="whitespace-nowrap text-muted-foreground">ISRC: {release.isrc || "-"}</span>
                </div>
              </div>

              <div className="flex flex-col items-center p-2 rounded-md border border-border/50 bg-card">
                <span className="text-muted-foreground mb-1">Catalog #</span>
                <span className="font-medium">{release.catalogNumber || "-"}</span>
              </div>

              {release.composers && release.composers.length > 0 && (
                <div className="flex flex-col items-center p-2 rounded-md border border-border/50 bg-card">
                  <span className="text-muted-foreground mb-1">Composers</span>
                  <span className="font-medium text-center truncate max-w-full">
                    {release.composers.join(", ")}
                  </span>
                </div>
              )}

              {release.composers && release.composers.length > 0 && (
                <div className="flex flex-col items-center p-2 rounded-md border border-border/50 bg-card">
                  <span className="text-muted-foreground mb-1">Authors</span>
                  <span className="font-medium text-center truncate max-w-full">
                    {release?.writers?.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Column: Cover Art */}
          <div className="space-y-3">
            <Card>
              <CardContent className="p-3">
                <div className="aspect-square relative rounded-md overflow-hidden border border-border bg-muted/30 flex items-center justify-center">
                  {release.coverArt ? (
                    <S3Image
                      src={release.coverArt.url}
                      alt={`${release.title} Cover Art`}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Music className="h-12 w-12 mb-1 opacity-50" />
                      <span className="text-xs">No Cover Art</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Tracks & Details */}
          <div className="lg:col-span-3 space-y-3">
            {/* Tracks Section */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileAudio className="h-4 w-4" />
                  Tracks
                </CardTitle>
                <CardDescription className="text-xs">
                  {release.tracks?.length || (release.audioFile ? 1 : 0)}{" "}
                  track(s) in this release
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {/* Single Track Release (Legacy/Simple structure) */}
                  {release.releaseType === "single" &&
                    release.audioFile &&
                    (!release.tracks || release.tracks.length === 0) && (
                      <div className="flex items-center justify-between p-2 rounded-md border border-border bg-card/50">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            1
                          </div>
                          <div>
                            <p className="font-medium text-sm">{release.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {release.artistName}
                            </p>
                          </div>
                        </div>
                        <a
                          href={release.audioFile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 px-2"
                        >
                          Play / Download
                        </a>
                      </div>
                    )}

                  {/* Multi-track Release */}
                  {release.tracks && release.tracks.length > 0 && (
                    <div className="space-y-1.5">
                      {release.tracks.map(
                        (track: TrackPayload, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-md border border-border bg-card/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{track.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {track.artistName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {track.isExplicit && (
                                <span className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-1 text-[10px]">
                                  E
                                </span>
                              )}
                              {track.audioFile && (
                                <a
                                  href={track.audioFile.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-7 px-2"
                                >
                                  Download
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Metadata */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">Distribution Details</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    Genres
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {releaseAny.primaryGenre && (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {releaseAny.primaryGenre}
                      </span>
                    )}
                    {releaseAny.secondaryGenre && (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {releaseAny.secondaryGenre}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    Copyrights
                  </h4>
                  <div className="space-y-1 text-xs">
                    <p>
                      <span className="text-muted-foreground mr-1.5">©</span>{" "}
                      {release.copyright || "N/A"}
                    </p>
                    <p>
                      <span className="text-muted-foreground mr-1.5">℗</span>{" "}
                      {release?.producers?.[0] || "N/A"}
                    </p>
                  </div>
                </div>

                {release.rejectionReason && release.status === "Rejected" && (
                  <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                    <h4 className="text-red-500 font-semibold text-xs mb-1 flex items-center gap-1.5">
                      Rejection Reason
                    </h4>
                    <p className="text-xs text-red-600/90 dark:text-red-400">
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
  );
}
