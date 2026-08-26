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
  Flag,
  AlertTriangle,
  Clock,
  Users,
  Mic2,
  Layers,
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
import {
  canManageReleases,
  formatReleaseStatus,
  getReleaseStatusColor,
  isRmEditableRelease,
} from "@/lib/release-status";
import { isReleaseNoLyrics } from "@/components/dashboard/upload/genre-language";
import { PlatformReleaseIcons } from "@/components/releases/platform-release-icons";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAudioUploadWarning,
  getCoverArtUploadWarnings,
  hasUploadWarning,
} from "@/lib/upload-warning";
import {
  hasDistributionIssueResubmitted,
  DISTRIBUTION_ISSUE_ACK_LABEL,
} from "@/lib/distribution-issue";

function formatDisplayDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

function joinNonEmpty(items?: string[]): string | null {
  const filtered = items?.map((item) => item?.trim()).filter(Boolean) ?? [];
  return filtered.length > 0 ? filtered.join(", ") : null;
}

export default function ReleaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const canManage = canManageReleases(user);
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
    const composersDisplay =
      joinNonEmpty(release.composers) ||
      joinNonEmpty(
        release.tracks?.flatMap((track) => track.composers ?? []) ?? [],
      );
    const featuredDisplay = joinNonEmpty(release.featuredArtists);
    const versionDisplay =
      typeof releaseAny.version === "string" ? releaseAny.version.trim() : null;
    const moodDisplay =
      typeof releaseAny.mood === "string"
        ? releaseAny.mood.trim()
        : joinNonEmpty(release.tracks?.map((track) => track.mood ?? "") ?? []);
    const socialLinks = [
      { label: "Spotify", value: releaseAny.spotifyProfile?.url || releaseAny.spotifyProfile?.uri },
      { label: "Apple Music", value: releaseAny.appleMusicProfile?.url },
      { label: "YouTube Music", value: releaseAny.youtubeMusicProfile?.url },
      { label: "Instagram", value: releaseAny.instagramProfileUrl || releaseAny.instagramProfile },
      { label: "Facebook", value: releaseAny.facebookProfileUrl || releaseAny.facebookProfile },
    ].filter((link) => typeof link.value === "string" && link.value.trim().length > 0);

    const infoCards = [
      { icon: <Disc />, label: "Type", value: release.releaseType },
      { icon: <Globe />, label: "Language", value: release.language },
      {
        icon: <Calendar />,
        label: "Release Date",
        value: formatDisplayDate(release.releaseDate),
      },
      {
        icon: <Calendar />,
        label: "Original Date",
        value: formatDisplayDate(release.originalReleaseDate),
      },
      { icon: <Disc3 />, label: "Label", value: release.labelName },
      { icon: <Music />, label: "Genre", value: releaseAny.primaryGenre },
      { icon: <Music />, label: "Sub-genre", value: releaseAny.secondaryGenre },
      { icon: <Layers />, label: "Version", value: versionDisplay },
      {
        icon: <Clock />,
        label: "Recording Year",
        value: release.recordingYear ? String(release.recordingYear) : null,
      },
      { icon: <Music />, label: "Mood", value: moodDisplay },
      {
        icon: <Flag />,
        label: "Explicit",
        value: release.isExplicit ? "Yes" : "No",
      },
      { icon: <Users />, label: "Featured", value: featuredDisplay },
      ...(writersDisplay
        ? [{ icon: <User />, label: "Lyricist", value: writersDisplay }]
        : []),
      ...(composersDisplay
        ? [{ icon: <Mic2 />, label: "Composer", value: composersDisplay }]
        : []),
    ].filter((item) => item.value && item.value !== "");

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
                {hasUploadWarning(release) && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-400"
                    title="This release has upload warnings"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Warnings
                  </span>
                )}
              </div>
              <p className="text-base text-white/50 flex items-center gap-2 font-medium">
                <User className="h-4 w-4" /> {release.artistName}
              </p>
              {release.status === "Released" &&
                Array.isArray(release.releasedOn?.platforms) &&
                release.releasedOn.platforms.length > 0 && (
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      Live on
                    </span>
                    <PlatformReleaseIcons
                      platforms={release.releasedOn.platforms}
                      iconClassName="h-8 w-8"
                      iconsOnly
                    />
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Release Info Grid */}
        <div className="flex flex-wrap gap-4 w-full">
          {infoCards.map((item, idx) => (
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
          {/* Left Column: Cover Art + Tracklist */}
          <div className="lg:col-span-5 space-y-6">
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

            {/* Tracklist under album cover — scrollable for albums */}
            <div className="bg-[#0A0A0B] border border-white/5 rounded-[32px] p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <FileAudio className="h-4 w-4 text-primary" />
                    </div>
                    Tracklist
                  </h2>
                  <p className="text-white/40 mt-1.5 text-xs">
                    {release.tracks?.length ?? 0} track(s) in this release
                  </p>
                </div>
              </div>

              <div
                className="max-h-[420px] overflow-y-auto overscroll-contain pr-1 space-y-3 scrollbar-thin"
                data-lenis-prevent="true"
              >
                {release.tracks && release.tracks.length > 0 ? (
                  release.tracks.map((track: TrackPayload, index: number) => {
                    const trackWriters = joinNonEmpty(track.writers);
                    const trackComposers = joinNonEmpty(track.composers);
                    const trackMeta = [
                      track.language ? `Language: ${track.language}` : null,
                      track.primaryGenre ? `Genre: ${track.primaryGenre}` : null,
                      track.secondaryGenre ? `Sub-genre: ${track.secondaryGenre}` : null,
                      track.mood ? `Mood: ${track.mood}` : null,
                      track.isInstrumental ? "Instrumental" : null,
                      track.featuringArtist ? `Feat. ${track.featuringArtist}` : null,
                      trackWriters ? `Lyricist: ${trackWriters}` : null,
                      trackComposers ? `Composer: ${trackComposers}` : null,
                      track.previewStartTime
                        ? `Preview: ${track.previewStartTime}s`
                        : null,
                    ].filter(Boolean);

                    return (
                      <div
                        key={index}
                        className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-colors group space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-colors flex items-center justify-center text-white/50 group-hover:text-primary font-black text-xs shadow-inner shrink-0">
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white text-sm flex items-center gap-2">
                                {track.title}
                                {track.isExplicit && (
                                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[9px] font-black tracking-widest leading-none">
                                    E
                                  </span>
                                )}
                                {track.isInstrumental && (
                                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[9px] font-black tracking-widest leading-none">
                                    INST
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-white/40">{track.artistName}</p>
                            </div>
                          </div>
                          {track.audioFile && (
                            <a
                              href={track.audioFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-full bg-white/10 hover:bg-primary hover:text-black text-white text-[10px] font-bold tracking-wide transition-all flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100"
                            >
                              <AudioWaveform className="w-3 h-3" />
                              Download
                            </a>
                          )}
                        </div>

                        {trackMeta.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pl-12">
                            {trackMeta.map((meta, metaIdx) => (
                              <span
                                key={`${index}-${metaIdx}`}
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/50 border border-white/5"
                              >
                                {meta}
                              </span>
                            ))}
                          </div>
                        )}

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
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">
                    No tracks in this release
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Full release details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Artists & profiles */}
            {(release.primaryArtists?.length || socialLinks.length > 0) && (
              <div className="bg-[#0A0A0B] border border-white/5 rounded-[32px] p-6 space-y-5 shadow-xl shadow-black/20">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Artists & Profiles
                </h3>
                {release.primaryArtists && release.primaryArtists.length > 0 && (
                  <div className="space-y-3">
                    {release.primaryArtists.map((artist, artistIdx) => (
                      <div
                        key={`${artist.name}-${artistIdx}`}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2"
                      >
                        <p className="text-sm font-bold text-white">{artist.name}</p>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {artist.spotifyProfile?.url && (
                            <a
                              href={artist.spotifyProfile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-full bg-white/5 text-white/60 hover:text-primary transition-colors"
                            >
                              Spotify
                            </a>
                          )}
                          {artist.appleMusicProfile?.url && (
                            <a
                              href={artist.appleMusicProfile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-full bg-white/5 text-white/60 hover:text-primary transition-colors"
                            >
                              Apple Music
                            </a>
                          )}
                          {artist.youtubeMusicProfile?.url && (
                            <a
                              href={artist.youtubeMusicProfile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-full bg-white/5 text-white/60 hover:text-primary transition-colors"
                            >
                              YouTube Music
                            </a>
                          )}
                          {artist.instagramProfile && (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                              Instagram: {artist.instagramProfile}
                            </span>
                          )}
                          {artist.facebookProfile && (
                            <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                              Facebook: {artist.facebookProfile}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={String(link.value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Distribution Details */}
            <div className="bg-[#0A0A0B] border border-white/5 rounded-[32px] p-6 space-y-6 shadow-xl shadow-black/20">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Distribution
              </h3>

              <div className="space-y-4">
                <div className="pt-0">
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

                {hasUploadWarning(release) && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mt-4 space-y-4">
                    <h4 className="text-amber-400 font-bold text-xs mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Upload Warnings
                    </h4>
                    <p className="text-[11px] text-amber-200/60 leading-relaxed">
                      {canManage
                        ? "Artist acknowledged these upload checks (separate from distribution issues)."
                        : "These checks were flagged when you uploaded. Edit the release to replace the audio or cover art if you want to resolve them."}
                    </p>
                    {getAudioUploadWarning(release) && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
                          Audio
                        </p>
                        <p className="text-sm text-amber-100/90 leading-relaxed whitespace-pre-wrap">
                          {getAudioUploadWarning(release)}
                        </p>
                      </div>
                    )}
                    {getCoverArtUploadWarnings(release).length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">
                          Cover art
                        </p>
                        <ul className="space-y-1.5">
                          {getCoverArtUploadWarnings(release).map((issue, idx) => (
                            <li
                              key={`${issue.code || "cover"}-${idx}`}
                              className="flex items-start gap-2 text-sm text-amber-100/90"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                              <span>{issue.message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!canManage && isRmEditableRelease(release.status) && (
                      <Link
                        href={`/dashboard/upload?edit=${release._id}`}
                        className="inline-flex text-xs font-semibold text-amber-300 underline-offset-2 hover:underline"
                      >
                        Edit release to fix
                      </Link>
                    )}
                  </div>
                )}

                {typeof release.distributionIssueNote === "string" &&
                  release.distributionIssueNote.trim().length > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 mt-4 space-y-3">
                      <h4 className="text-orange-400 font-bold text-xs mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                        <Flag className="h-3.5 w-3.5" />
                        Distribution Issue
                      </h4>
                      {canManage &&
                        hasDistributionIssueResubmitted(
                          release.distributionIssueResubmittedAt,
                          release.distributionIssueResolvedAt,
                        ) && (
                          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            Artist marked as fixed
                            {release.distributionIssueResubmittedAt ? (
                              <span className="font-normal normal-case tracking-normal text-emerald-200/80">
                                · {new Date(release.distributionIssueResubmittedAt).toLocaleString()}
                              </span>
                            ) : null}
                          </div>
                        )}
                      <p className="text-[11px] text-orange-200/60 leading-relaxed">
                        {canManage
                          ? "Distributor issue — not an upload warning."
                          : release.distributionIssueResubmittedAt
                            ? "You submitted your fix. Status stays In Process until RM accepts."
                            : "The distributor reported an issue. Fix it, confirm here — status stays In Process until RM accepts."}
                      </p>
                      <p className="text-sm text-orange-100/90 leading-relaxed whitespace-pre-wrap">
                        {release.distributionIssueNote.trim()}
                      </p>
                      {!canManage && release.distributionIssueResubmittedAt && (
                        <label className="flex items-start gap-3 cursor-default opacity-90">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            readOnly
                            className="mt-0.5 h-4 w-4 rounded border-border accent-amber-500"
                          />
                          <span className="text-sm text-orange-100/90">{DISTRIBUTION_ISSUE_ACK_LABEL}</span>
                        </label>
                      )}
                      {!canManage && isRmEditableRelease(release.status) && (
                        <Link
                          href={`/dashboard/upload?edit=${release._id}`}
                          className="inline-flex text-xs font-semibold text-orange-300 underline-offset-2 hover:underline"
                        >
                          Edit release to fix
                        </Link>
                      )}
                    </div>
                  )}

                {typeof release.draftReviewNote === "string" &&
                  release.draftReviewNote.trim().length > 0 && (
                    <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 mt-4 space-y-3">
                      <h4 className="text-sky-400 font-bold text-xs mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                        <Flag className="h-3.5 w-3.5" />
                        Review Feedback
                      </h4>
                      {canManage && release.draftReviewResubmittedAt && (
                          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                            Artist marked as fixed
                            <span className="font-normal normal-case tracking-normal text-emerald-200/80">
                              · {new Date(release.draftReviewResubmittedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      <p className="text-[11px] text-sky-200/60 leading-relaxed">
                        {canManage
                          ? release.status === "In Process"
                            ? "Admin review feedback — use Distribute when ready."
                            : "Admin review feedback — use Actions to approve when ready."
                          : release.draftReviewResubmittedAt
                            ? `You submitted your fix. Status stays ${release.status} until RM ${release.status === "In Process" ? "reviews" : "approves"}.`
                            : "Our team reviewed your release and found items to fix. Update your release, then confirm on the releases page."}
                      </p>
                      <p className="text-sm text-sky-100/90 leading-relaxed whitespace-pre-wrap">
                        {release.draftReviewNote.trim()}
                      </p>
                      {!canManage && release.draftReviewResubmittedAt && (
                        <label className="flex items-start gap-3 cursor-default opacity-90">
                          <input
                            type="checkbox"
                            checked
                            disabled
                            readOnly
                            className="mt-0.5 h-4 w-4 rounded border-border accent-sky-500"
                          />
                          <span className="text-sm text-sky-100/90">{DISTRIBUTION_ISSUE_ACK_LABEL}</span>
                        </label>
                      )}
                      {!canManage && isRmEditableRelease(release.status) && (
                        <Link
                          href={`/dashboard/upload?edit=${release._id}`}
                          className="inline-flex text-xs font-semibold text-sky-300 underline-offset-2 hover:underline"
                        >
                          Edit release to fix
                        </Link>
                      )}
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
