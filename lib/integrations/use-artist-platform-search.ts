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

/** Per-index loading skeleton — avoids blocking other artists during search. */
export function shouldShowArtistSearchSkeleton(
  isSearchingThisIndex: boolean,
  isActiveSearch: boolean,
  hasAnySelection: boolean,
): boolean {
  return isSearchingThisIndex && isActiveSearch && !hasAnySelection;
}

export function useArtistPlatformSearch() {
  const [searchResults, setSearchResults] = useState<ArtistSearchResults>(
    emptySearchResults(),
  );
  const [searchCache, setSearchCache] = useState<
    Record<string, { results: ArtistSearchResults; hasSearched: boolean }>
  >({});
  const [searchingIndex, setSearchingIndex] = useState<ArtistSearchIndex | null>(
    null,
  );
  const [hasSearched, setHasSearched] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] =
    useState<ArtistSearchIndex | null>(null);
  const [activeSearchQuery, setActiveSearchQuery] = useState<{
    index: ArtistSearchIndex;
    name: string;
  } | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightIndex = useRef<ArtistSearchIndex | null>(null);

  const handleSearch = useCallback((name: string, index: ArtistSearchIndex) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    const trimmed = name.trim();
    setActiveSearchIndex(index);
    setActiveSearchQuery(trimmed ? { index, name: trimmed } : null);

    if (trimmed.length >= 2) {
      setSearchingIndex(index);
      setSearchResults(emptySearchResults());
      setHasSearched(false);

      searchTimeout.current = setTimeout(async () => {
        inFlightIndex.current = index;
        const cacheKey = buildArtistSearchCacheKey(index, trimmed);
        try {
          const results = await searchArtistProfiles(trimmed, {
            spotifyLimit: 10,
            appleLimit: 15,
            cosmosLimit: 15,
          });
          setSearchCache((prev) => ({
            ...prev,
            [cacheKey]: { results, hasSearched: true },
          }));
          if (inFlightIndex.current === index) {
            setSearchResults(results);
          }
        } catch (error) {
          console.error('Search error:', error);
          const results = emptySearchResults();
          setSearchCache((prev) => ({
            ...prev,
            [cacheKey]: { results, hasSearched: true },
          }));
          if (inFlightIndex.current === index) {
            setSearchResults(results);
          }
        } finally {
          if (inFlightIndex.current === index) {
            setSearchingIndex(null);
            setHasSearched(true);
          }
        }
      }, 1000);
    } else {
      setSearchingIndex(null);
      setSearchResults(emptySearchResults());
      setHasSearched(false);
    }
  }, []);

  const isSearchingForIndex = useCallback(
    (index: ArtistSearchIndex): boolean => searchingIndex === index,
    [searchingIndex],
  );

  const getIndexResults = useCallback(
    (index: ArtistSearchIndex, name: string): ArtistSearchResults => {
      const trimmed = name.trim();
      if (trimmed.length < 2) return emptySearchResults();

      const cacheKey = buildArtistSearchCacheKey(index, trimmed);
      const cached = searchCache[cacheKey];
      const isActiveQuery =
        activeSearchQuery?.index === index &&
        activeSearchQuery.name.toLowerCase() === trimmed.toLowerCase();

      if (isActiveQuery && (searchingIndex === index || hasSearched)) {
        return searchResults;
      }
      return cached?.results ?? emptySearchResults();
    },
    [
      activeSearchQuery,
      hasSearched,
      searchingIndex,
      searchCache,
      searchResults,
    ],
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

      return Boolean(
        cached?.hasSearched || (isActiveQuery && hasSearched),
      );
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
    setSearchingIndex(null);
    setHasSearched(false);
    inFlightIndex.current = null;
  }, []);

  return {
    searchResults,
    searchCache,
    /** @deprecated Prefer isSearchingForIndex — global flag is true for any in-flight search */
    isSearching: searchingIndex !== null,
    isSearchingForIndex,
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
