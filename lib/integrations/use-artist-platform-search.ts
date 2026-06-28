'use client';

import { useCallback, useRef, useState } from 'react';
import {
  emptySearchResults,
  searchArtistProfiles,
  type ArtistSearchResults,
} from '@/lib/integrations/artist-search.util';

export type ArtistSearchIndex = number | 'main';

function searchIndexKey(index: ArtistSearchIndex): string {
  return index === 'main' ? 'main' : String(index);
}

export function buildArtistSearchCacheKey(
  index: ArtistSearchIndex,
  name: string,
): string {
  return `${searchIndexKey(index)}:${name.trim().toLowerCase()}`;
}

export function useArtistPlatformSearch() {
  const [searchResults, setSearchResults] = useState<ArtistSearchResults>(
    emptySearchResults(),
  );
  const [searchCache, setSearchCache] = useState<
    Record<string, { results: ArtistSearchResults; hasSearched: boolean }>
  >({});
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] =
    useState<ArtistSearchIndex | null>(null);
  const [activeSearchQuery, setActiveSearchQuery] = useState<{
    index: ArtistSearchIndex;
    name: string;
  } | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((name: string, index: ArtistSearchIndex) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    const trimmed = name.trim();
    setActiveSearchIndex(index);
    setActiveSearchQuery(trimmed ? { index, name: trimmed } : null);

    if (trimmed.length >= 2) {
      setSearchResults(emptySearchResults());
      setIsSearching(true);
      setHasSearched(false);

      searchTimeout.current = setTimeout(async () => {
        const cacheKey = buildArtistSearchCacheKey(index, trimmed);
        try {
          const results = await searchArtistProfiles(trimmed, {
            spotifyLimit: 10,
            appleLimit: 15,
            cosmosLimit: 15,
          });
          setSearchResults(results);
          setSearchCache((prev) => ({
            ...prev,
            [cacheKey]: { results, hasSearched: true },
          }));
        } catch (error) {
          console.error('Search error:', error);
          const results = emptySearchResults();
          setSearchResults(results);
          setSearchCache((prev) => ({
            ...prev,
            [cacheKey]: { results, hasSearched: true },
          }));
        } finally {
          setIsSearching(false);
          setHasSearched(true);
        }
      }, 1000);
    } else {
      setSearchResults(emptySearchResults());
      setIsSearching(false);
      setHasSearched(false);
    }
  }, []);

  const getIndexResults = useCallback(
    (index: ArtistSearchIndex, name: string): ArtistSearchResults => {
      const trimmed = name.trim();
      if (trimmed.length < 2) return emptySearchResults();

      const cacheKey = buildArtistSearchCacheKey(index, trimmed);
      const cached = searchCache[cacheKey];
      const isActiveQuery =
        activeSearchQuery?.index === index &&
        activeSearchQuery.name.toLowerCase() === trimmed.toLowerCase();

      if (isActiveQuery && (isSearching || hasSearched)) {
        return searchResults;
      }
      return cached?.results ?? emptySearchResults();
    },
    [activeSearchQuery, hasSearched, isSearching, searchCache, searchResults],
  );

  const indexHasSearched = useCallback(
    (index: ArtistSearchIndex, name: string): boolean => {
      const trimmed = name.trim();
      if (trimmed.length < 2) return false;

      const cacheKey = buildArtistSearchCacheKey(index, trimmed);
      const cached = searchCache[cacheKey];
      const isActiveQuery =
        activeSearchQuery?.index === index &&
        activeSearchQuery.name.toLowerCase() === trimmed.toLowerCase();

      return Boolean(cached?.hasSearched || (isActiveQuery && hasSearched));
    },
    [activeSearchQuery, hasSearched, searchCache],
  );

  const getCachedSearch = useCallback(
    (index: ArtistSearchIndex, name: string) => {
      const trimmed = name.trim();
      if (trimmed.length < 2) return undefined;
      return searchCache[buildArtistSearchCacheKey(index, trimmed)];
    },
    [searchCache],
  );

  const resetSearchForIndex = useCallback((index: ArtistSearchIndex) => {
    setActiveSearchIndex(index);
    setActiveSearchQuery(null);
    setSearchResults(emptySearchResults());
    setIsSearching(false);
    setHasSearched(false);
  }, []);

  return {
    searchResults,
    searchCache,
    isSearching,
    hasSearched,
    activeSearchIndex,
    setActiveSearchIndex,
    handleSearch,
    getIndexResults,
    indexHasSearched,
    getCachedSearch,
    resetSearchForIndex,
    searchIndexKey,
  };
}
