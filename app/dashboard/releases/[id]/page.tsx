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
  Disc3,
  QrCode,
  BookOpenText,
  AudioWaveform,
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
        <Card className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 mb-8">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">Release Info</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-gray-50 dark:bg-[#202024] p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition hover:border-gray-300 dark:hover:border-gray-600">
                <span className="material-icons-round text-gray-400 mb-2"><Disc /></span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {release.releaseType}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-[#202024] p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition hover:border-gray-300 dark:hover:border-gray-600">
                <span className="material-icons-round text-gray-400 mb-2"><Globe /></span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Language</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {release.language}
                </span>
              </div>

              {release.releaseDate && (
                <div className="bg-gray-50 dark:bg-[#202024] p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition hover:border-gray-300 dark:hover:border-gray-600">
                  <span className="material-icons-round text-gray-400 mb-2"><Calendar /></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Date</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {new Date(release.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              {release.labelName && (
                <div className="bg-gray-50 dark:bg-[#202024] p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition hover:border-gray-300 dark:hover:border-gray-600">
                  <span className="material-icons-round text-gray-400 mb-2"><Disc3 /></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Label</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {release.labelName}
                  </span>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-[#202024] p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition hover:border-gray-300 dark:hover:border-gray-600">
                <span className="material-icons-round text-gray-400 mb-2"><QrCode /></span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">UPC / ISRC</span>
                <div className="flex flex-col items-center text-[10px] font-medium leading-tight">
                  <span className="whitespace-nowrap">UPC: {release.barcode || "-"}</span>
                  <span className="whitespace-nowrap text-muted-foreground">ISRC: {release.isrc || "-"}</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#202024] p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition hover:border-gray-300 dark:hover:border-gray-600">
                <span className="material-icons-round text-gray-400 mb-2"><BookOpenText /></span>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Catalog #</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {release.catalogNumber || "-"}
                </span>
              </div>

              {release.composers && release.composers.length > 0 && (
                <div className="bg-gray-50 dark:bg-[#202024] p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition hover:border-gray-300 dark:hover:border-gray-600">
                  <span className="material-icons-round text-gray-400 mb-2"><AudioWaveform /></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Composers</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {release.composers.join(", ")}
                  </span>
                </div>
              )}

              {release.composers && release.composers.length > 0 && (
                <div className="bg-gray-50 dark:bg-[#202024] p-4 rounded-lg border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center transition hover:border-gray-300 dark:hover:border-gray-600">
                  <span className="material-icons-round text-gray-400 mb-2"><User /></span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Authors</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white mt-1">
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
            <Card className="rounded-xl overflow-hidden">
              <CardContent className="p-0 rounded-xl ">
                <div className="aspect-square relative rounded-md overflow-hidden bg-muted/30 flex items-center justify-center rounded-xl ">
                  {release.coverArt ? (
                    <img
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
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileAudio className="h-4 w-4 text-primary" />
                  Tracks
                </CardTitle>
                <CardDescription className="text-sm">
                  {release.tracks?.length || (release.audioFile ? 1 : 0)}{" "}
                  track(s) in this release
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 mt-2">
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
                <CardTitle className="text-lg">Distribution Details</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    Genres
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {releaseAny.primaryGenre && (
                      <span className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 dark:bg-[#2a2a2d] dark:text-gray-300 border border-transparent dark:border-gray-700">
                        {releaseAny.primaryGenre}
                      </span>
                    )}
                    {releaseAny.secondaryGenre && (
                      <span className="px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 dark:bg-[#2a2a2d] dark:text-gray-300 border border-transparent dark:border-gray-700">
                        {releaseAny.secondaryGenre}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                    Copyrights
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 text-[10px] flex items-center justify-center mr-2 text-gray-500 dark:text-gray-400">C</span>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{release.copyright || "N/A"}</p>
                    </div>
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 text-[10px] flex items-center justify-center mr-2 text-gray-500 dark:text-gray-400">P</span>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{release?.producers?.[0] || "N/A"}</p>
                    </div>
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
