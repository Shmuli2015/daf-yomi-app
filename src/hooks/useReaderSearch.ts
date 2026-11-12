import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';
import {
  searchInSegments,
  type SearchableSegment,
  type SearchMatchLocation,
} from '../utils/textSearch';

const SEARCH_DEBOUNCE_MS = 150;

interface UseReaderSearchOptions {
  segments: SearchableSegment[];
  resetKey: string;
}

export function useReaderSearch({ segments, resetKey }: UseReaderSearchOptions) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
  const highlightQuery = isSearchActive ? debouncedQuery : '';

  const matches = useMemo<SearchMatchLocation[]>(() => {
    if (!highlightQuery.trim()) {
      return [];
    }
    return searchInSegments(segments, highlightQuery);
  }, [highlightQuery, segments]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [highlightQuery, resetKey, isSearchActive]);

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
    highlightQuery,
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
