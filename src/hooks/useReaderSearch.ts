import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  searchInSegments,
  type SearchableSegment,
  type SearchMatchLocation,
} from '../utils/textSearch';

interface UseReaderSearchOptions {
  segments: SearchableSegment[];
  resetKey: string;
}

export function useReaderSearch({ segments, resetKey }: UseReaderSearchOptions) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const matches = useMemo<SearchMatchLocation[]>(() => {
    if (!isSearchActive || !searchQuery.trim()) {
      return [];
    }
    return searchInSegments(segments, searchQuery);
  }, [isSearchActive, searchQuery, segments]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [searchQuery, resetKey, isSearchActive]);

  useEffect(() => {
    if (matches.length === 0) {
      setActiveMatchIndex(0);
      return;
    }
    if (activeMatchIndex >= matches.length) {
      setActiveMatchIndex(0);
    }
  }, [matches, activeMatchIndex]);

  const activeMatch = matches[activeMatchIndex] ?? null;

  const openSearch = useCallback(() => {
    setIsSearchActive(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchActive(false);
    setSearchQuery('');
    setActiveMatchIndex(0);
  }, []);

  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    setActiveMatchIndex((prev) => (prev + 1) % matches.length);
  }, [matches.length]);

  const goToPrevMatch = useCallback(() => {
    if (matches.length === 0) return;
    setActiveMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  }, [matches.length]);

  return {
    isSearchActive,
    searchQuery,
    setSearchQuery,
    matches,
    activeMatchIndex,
    activeMatch,
    openSearch,
    closeSearch,
    goToNextMatch,
    goToPrevMatch,
  };
}
