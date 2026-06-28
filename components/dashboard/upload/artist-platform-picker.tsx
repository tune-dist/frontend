'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Link as LinkIcon, Music, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ArtistSearchResponse } from '@/lib/api/artist-search';
import { resolvePlatformProfile } from '@/lib/integrations/platform-profile.util';
import type { PlatformKey } from '@/lib/integrations/apply-artist-profile-selection';

type ArtistPlatformPickerProps = {
  artistName: string;
  results: ArtistSearchResponse;
  isSearching: boolean;
  isActiveSearch: boolean;
  hasSearchedForIndex: boolean;
  spotifyProfile: unknown;
  appleMusicProfile: unknown;
  youtubeMusicProfile: unknown;
  onSelectProfile: (platform: PlatformKey, profile: unknown | 'new' | '') => void;
  isArtistFromRoster?: boolean;
  usedArtists?: unknown[];
  profilesPendingNotice?: boolean;
};

function PlatformIcon({ platform }: { platform: PlatformKey }) {
  if (platform === 'spotify') {
    return (
      <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    );
  }
  if (platform === 'apple') {
    return (
      <svg className="h-5 w-5 text-[#FA243C]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.227 15.653c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08z" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
    </svg>
  );
}

function platformLabel(platform: PlatformKey): string {
  if (platform === 'spotify') return 'Spotify';
  if (platform === 'apple') return 'Apple Music';
  return 'YouTube Music';
}

function urlPlaceholder(platform: PlatformKey): string {
  if (platform === 'spotify') return 'https://open.spotify.com/artist/...';
  if (platform === 'apple') return 'https://music.apple.com/artist/...';
  return 'https://music.youtube.com/channel/...';
}

function SelectedProfileCard({
  platform,
  profileData,
  artistName,
  results,
  usedArtists,
  isArtistFromRoster,
  onClear,
}: {
  platform: PlatformKey;
  profileData: unknown;
  artistName: string;
  results: ArtistSearchResponse;
  usedArtists: unknown[];
  isArtistFromRoster: boolean;
  onClear: () => void;
}) {
  const resolved = resolvePlatformProfile(
    platform,
    profileData,
    artistName,
    results,
    usedArtists,
  );
  if (!resolved) return null;

  if (resolved === 'new') {
    return (
      <div className="bg-primary/10 border border-primary rounded-md p-3 flex flex-col">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-primary">New Artist Profile</p>
            <p className="text-sm text-muted-foreground">
              Creating a new profile for {artistName}
            </p>
          </div>
          {!isArtistFromRoster && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 text-xs text-muted-foreground hover:text-red-500"
            >
              Change
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (typeof resolved === 'string') {
    return (
      <div className="bg-primary/10 border border-primary rounded-md p-3 flex flex-col">
        <div className="flex items-center gap-3">
          <a
            href={resolved.startsWith('http') ? resolved : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <PlatformIcon platform={platform} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-primary hover:underline">Profile Linked</p>
              <p className="text-sm text-muted-foreground truncate" title={resolved}>
                {resolved}
              </p>
            </div>
          </a>
          <div className="flex items-center gap-1">
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              Selected
            </span>
            {!isArtistFromRoster && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500"
              >
                Change
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const row = resolved as Record<string, unknown>;
  const profileUrl =
    (row.externalUrl as string) ||
    (row.url as string) ||
    (row.channelUrl as string);

  return (
    <div className="bg-primary/10 border border-primary rounded-md p-3 flex flex-col">
      <div className="flex items-center gap-3">
        <a
          href={profileUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
          style={{ cursor: profileUrl ? 'pointer' : 'default' }}
        >
          {row.image ? (
            <img
              src={String(row.image)}
              alt={String(row.name ?? '')}
              className="h-10 w-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Music className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium text-primary ${profileUrl ? 'hover:underline' : ''} truncate`}
            >
              {String(row.name ?? '')}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {typeof row.followers === 'number'
                ? `${row.followers.toLocaleString()} followers`
                : String(row.track ?? '')}
            </p>
          </div>
        </a>
        <div className="flex items-center gap-1">
          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
            Selected
          </span>
          {!isArtistFromRoster && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500"
            >
              Change
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PlatformColumn({
  platform,
  artistName,
  results,
  currentProfile,
  hasSearchedForIndex,
  usedArtists,
  isArtistFromRoster,
  onSelectProfile,
}: {
  platform: PlatformKey;
  artistName: string;
  results: ArtistSearchResponse;
  currentProfile: unknown;
  hasSearchedForIndex: boolean;
  usedArtists: unknown[];
  isArtistFromRoster: boolean;
  onSelectProfile: (platform: PlatformKey, profile: unknown | 'new' | '') => void;
}) {
  const rows =
    platform === 'spotify'
      ? results.spotify
      : platform === 'apple'
        ? results.apple
        : results.youtube;

  if (!(rows.length > 0 || currentProfile || hasSearchedForIndex)) {
    return null;
  }

  return (
    <div className="space-y-3 flex flex-col">
      <div className="flex items-center gap-2">
        <PlatformIcon platform={platform} />
        <span className="text-sm font-medium">{platformLabel(platform)}</span>
      </div>

      {currentProfile ? (
        <SelectedProfileCard
          platform={platform}
          profileData={currentProfile}
          artistName={artistName}
          results={results}
          usedArtists={usedArtists}
          isArtistFromRoster={isArtistFromRoster}
          onClear={() => onSelectProfile(platform, '')}
        />
      ) : (
        <>
          {rows.map((artist) => (
            <div
              key={artist.id}
              className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-accent transition-colors cursor-pointer"
              onClick={() => onSelectProfile(platform, artist)}
            >
              <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                <div className="h-2 w-2 rounded-full hidden" />
              </div>
              {artist.image ? (
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Music className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{artist.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {platform === 'spotify'
                    ? `${(artist.followers || 0).toLocaleString()} followers`
                    : artist.track || 'Profile'}
                </p>
              </div>
              {(artist.externalUrl || artist.url || artist.channelUrl) && (
                <a
                  href={artist.externalUrl || artist.url || artist.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-primary"
                  title={`Open in ${platformLabel(platform)}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}

          <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
            <div
              className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onSelectProfile(platform, 'new')}
            >
              <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Create New Profile</p>
                <p className="text-sm text-muted-foreground">
                  Create a new {platformLabel(platform)} profile for{' '}
                  <strong>{artistName}</strong>
                </p>
              </div>
            </div>
            <div className="px-1">
              <Label className="text-xs font-medium text-foreground mb-1.5 block px-2">
                Or paste {platformLabel(platform)} URL
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={urlPlaceholder(platform)}
                  className="h-9 text-sm pl-9"
                  onBlur={(e) => {
                    if (e.target.value) onSelectProfile(platform, e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (e.currentTarget.value) {
                        onSelectProfile(platform, e.currentTarget.value);
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ArtistPlatformPicker({
  artistName,
  results,
  isSearching,
  isActiveSearch,
  hasSearchedForIndex,
  spotifyProfile,
  appleMusicProfile,
  youtubeMusicProfile,
  onSelectProfile,
  isArtistFromRoster = false,
  usedArtists = [],
  profilesPendingNotice = false,
}: ArtistPlatformPickerProps) {
  if (!artistName || artistName.length < 2) return null;

  const hasAnySelection = !!(spotifyProfile || appleMusicProfile || youtubeMusicProfile);
  const showBlock = hasAnySelection || hasSearchedForIndex || isActiveSearch;
  if (!showBlock) return null;

  const showLoadingSkeleton = isSearching && isActiveSearch && !hasAnySelection;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-6 border border-border rounded-lg p-4 bg-black"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-foreground">
          We found this artist on other platforms. Is this you?
        </h4>
        {isSearching && isActiveSearch && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="text-xs">Searching...</span>
          </div>
        )}
      </div>

      {profilesPendingNotice && (
        <p className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
          Your profiles may now be available on Spotify or Apple Music — please confirm or select yours below.
        </p>
      )}

      {showLoadingSkeleton ? (
        <div className="space-y-4 opacity-50 pointer-events-none">
          <div className="h-12 bg-muted/20 rounded-md animate-pulse" />
          <div className="h-12 bg-muted/20 rounded-md animate-pulse" />
          <div className="h-12 bg-muted/20 rounded-md animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlatformColumn
            platform="spotify"
            artistName={artistName}
            results={results}
            currentProfile={spotifyProfile}
            hasSearchedForIndex={hasSearchedForIndex}
            usedArtists={usedArtists}
            isArtistFromRoster={isArtistFromRoster}
            onSelectProfile={onSelectProfile}
          />
          <PlatformColumn
            platform="apple"
            artistName={artistName}
            results={results}
            currentProfile={appleMusicProfile}
            hasSearchedForIndex={hasSearchedForIndex}
            usedArtists={usedArtists}
            isArtistFromRoster={isArtistFromRoster}
            onSelectProfile={onSelectProfile}
          />
          <PlatformColumn
            platform="youtube"
            artistName={artistName}
            results={results}
            currentProfile={youtubeMusicProfile}
            hasSearchedForIndex={hasSearchedForIndex}
            usedArtists={usedArtists}
            isArtistFromRoster={isArtistFromRoster}
            onSelectProfile={onSelectProfile}
          />
        </div>
      )}
    </motion.div>
  );
}
