"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TrackAudioPlayer } from "@/components/releases/track-audio-player";
import { useReleaseTrackPlayback } from "@/lib/releases/use-release-track-playback";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  Music,
  User,
  Globe,
  Disc,
  FileAudio,
  Disc3,
  AudioWaveform,
  Hash,
} from "lucide-react";
import { getRelease, Release, TrackPayload } from "@/lib/api/releases";
import PageLoading from "@/components/dashboard/page-loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { S3Image } from "@/components/ui/s3-image";
import { formatReleaseStatus, getReleaseStatusColor } from "@/lib/release-status";
import {
  formatReleaseCodeDisplay,
  getTrackIsrcDisplay,
} from "@/lib/release-codes";
import { isReleaseNoLyrics } from "@/components/dashboard/upload/genre-language";

export default function ReleaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    audioRef,
    activeTrackIndex,
    isPlaying,
    loadingTrackIndex,
    currentTime,
    duration,
    toggleTrackPlayback,
    seekTo,
    beginSeek,
    endSeek,
    stopPlayback,
  } = useReleaseTrackPlayback();

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

  useEffect(() => {
    return () => stopPlayback();
  }, [stopPlayback]);

  const getStatusColor = getReleaseStatusColor;
  const formatStatus = formatReleaseStatus;

  let content: ReactNode;

  if (loading) {
    content = <PageLoading />;
  } else if (error || !release) {
    content = (
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
    );
  } else {
    const releaseAny = release as any;
    const releaseNoLyrics = isReleaseNoLyrics({
      primaryGenre: releaseAny.primaryGenre,
      language: release.language,
      instrumental: releaseAny.instrumental,
      isInstrumentalFlag: releaseAny.isInstrumentalFlag,
    });
    const writersDisplay =
      !releaseNoLyrics && release.writers?.filter((w) => w?.trim()).length
        ? release.writers.filter((w) => w?.trim()).join(", ")
        : null;

    content = (
      <div className="space-y-8 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/releases">
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all">
                <ArrowLeft className="h-5 w-5 text-white/70" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {release.title}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(
                    release.status
                  )}`}
                >
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                  {formatStatus(release.status)}
                </span>
              </div>
              <p className="text-base text-white/50 flex items-center gap-2 font-medium">
                <User className="h-4 w-4" /> {release.artistName}
              </p>
            </div>
          </div>
        </div>

        {/* Release Info Grid */}
        <div className="flex flex-wrap gap-4 w-full">
          {[
            { icon: <Disc />, label: "Type", value: release.releaseType },
            { icon: <Globe />, label: "Language", value: release.language },
            { icon: <Calendar />, label: "Date", value: release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : null },
            { icon: <Disc3 />, label: "Label", value: release.labelName },
            { icon: <Hash />, label: "Release ID", value: formatReleaseCodeDisplay(release) },
            ...(writersDisplay
              ? [{ icon: <User />, label: "Lyricist", value: writersDisplay }]
              : []),
          ].filter(item => item.value && item.value !== "").map((item, idx) => (
            <div key={idx} className="flex-1 min-w-[140px] bg-[#0A0A0B] border border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-colors relative overflow-hidden shadow-xl shadow-black/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">{item.label}</span>
              <span className="text-sm font-bold text-white/90 truncate w-full px-2">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cover Art */}
          <div className="lg:col-span-4 space-y-6">
            <div className="aspect-square relative rounded-[40px] overflow-hidden bg-[#0A0A0B] border border-white/5 flex items-center justify-center shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] group">
              {release.coverArt ? (
                <>
                  <S3Image
                    src={release.coverArt.url}
                    alt={`${release.title} Cover Art`}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[40px] pointer-events-none" />
                </>
              ) : (
                <div className="flex flex-col items-center text-white/20">
                  <Music className="h-16 w-16 mb-4 opacity-50" />
                  <span className="text-sm font-medium">No Cover Art</span>
                </div>
              )}
            </div>

            {/* Distribution Details inside left column */}
            <div className="bg-[#0A0A0B] border border-white/5 rounded-[32px] p-6 space-y-6 shadow-xl shadow-black/20">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Distribution
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
                    Genres
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {releaseAny.primaryGenre && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {releaseAny.primaryGenre}
                      </span>
                    )}
                    {releaseAny.secondaryGenre && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-white/70 border border-white/5">
                        {releaseAny.secondaryGenre}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
                    Copyrights
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-white">C</span>
                      </div>
                      <p className="text-sm text-white/80 font-medium leading-relaxed">{release.copyright || "N/A"}</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-white">P</span>
                      </div>
                      <p className="text-sm text-white/80 font-medium leading-relaxed">
                        {release.publisher || release.producers?.[0] || release.labelName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {release.rejectionReason && release.status === "Rejected" && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mt-4">
                    <h4 className="text-red-500 font-bold text-xs mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      Rejection Reason
                    </h4>
                    <p className="text-sm text-red-200/90 leading-relaxed">
                      {release.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tracks */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#0A0A0B] border border-white/5 rounded-[40px] p-8 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileAudio className="h-5 w-5 text-primary" />
                    </div>
                    Tracklist
                  </h2>
                  <p className="text-white/40 mt-2 text-sm">
                    {release.tracks?.length ?? 0} track(s) in this release
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {release.tracks && release.tracks.length > 0 && (
                  <div className="space-y-3">
                    {release.tracks.map((track: TrackPayload, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-colors group space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-colors flex items-center justify-center text-white/50 group-hover:text-primary font-black text-sm shadow-inner shrink-0">
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-base flex items-center gap-2">
                                {track.title}
                                {track.isExplicit && (
                                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[9px] font-black tracking-widest leading-none">
                                    E
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-white/40">{track.artistName}</p>
                              <p className="text-[10px] font-mono text-white/30 mt-1">
                                ISRC: {getTrackIsrcDisplay(track, release)}
                              </p>
                            </div>
                          </div>
                          {track.audioFile && (
                            <a
                              href={track.audioFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-primary hover:text-black text-white text-xs font-bold tracking-wide transition-all flex items-center gap-2 shrink-0 opacity-80 group-hover:opacity-100"
                            >
                              <AudioWaveform className="w-3.5 h-3.5" />
                              Download
                            </a>
                          )}
                        </div>

                        {track.audioFile && (
                          <TrackAudioPlayer
                            isActive={activeTrackIndex === index}
                            isPlaying={activeTrackIndex === index && isPlaying}
                            loading={loadingTrackIndex === index}
                            currentTime={currentTime}
                            duration={duration}
                            durationHint={track.audioFile.duration}
                            onToggle={() => {
                              void toggleTrackPlayback(index, track.audioFile!.url).catch(() => {
                                toast.error("Could not play this track");
                              });
                            }}
                            onSeekStart={beginSeek}
                            onSeek={(time) => {
                              if (activeTrackIndex === index) {
                                seekTo(time);
                              }
                            }}
                            onSeekEnd={(time) => {
                              if (activeTrackIndex === index) {
                                endSeek(time);
                              }
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={stopPlayback}
        preload="none"
        className="hidden"
      />
      {content}
    </>
  );
}
