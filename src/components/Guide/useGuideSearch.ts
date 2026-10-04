import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { GUIDE_SECTIONS } from './guideData';
import { GUIDE_FAQ_ITEMS } from './guideFaqData';
import type { GuideCategoryId } from './guideCategories';
import {
  countFaqItemsByCategory,
  countSectionItems,
  filterFaqItems,
  filterGuideSections,
} from './guideFilters';
import { buildHighlightRegex, tokenizeQuery } from './guideSearchUtils';

interface UseGuideSearchOptions {
  visible: boolean;
  initialCategory?: GuideCategoryId;
}

export function useGuideSearch({ visible, initialCategory }: UseGuideSearchOptions) {
  const [searchQuery, setSearchQueryState] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<GuideCategoryId | null>(
    initialCategory ?? null,
  );

  useEffect(() => {
    if (visible) {
      setSearchQueryState('');
      setActiveCategoryId(initialCategory ?? null);
    }
  }, [visible, initialCategory]);

  const deferredQuery = useDeferredValue(searchQuery);
  const searchTokens = useMemo(() => tokenizeQuery(deferredQuery), [deferredQuery]);
  const searchKey = searchTokens.join(' ');
  const hasSearch = searchTokens.length > 0;
  const highlightRegex = useMemo(() => buildHighlightRegex(searchTokens), [searchTokens]);

  const searchedFaqItems = useMemo(
    () => filterFaqItems(GUIDE_FAQ_ITEMS, searchTokens),
    [searchTokens],
  );

  const filteredFaqItems = useMemo(
    () =>
      activeCategoryId
        ? searchedFaqItems.filter((item) => item.categoryId === activeCategoryId)
        : searchedFaqItems,
    [searchedFaqItems, activeCategoryId],
  );

  const categoryCounts = useMemo(
    () => countFaqItemsByCategory(searchedFaqItems),
    [searchedFaqItems],
  );

  const filteredSections = useMemo(
    () => filterGuideSections(GUIDE_SECTIONS, searchTokens),
    [searchTokens],
  );

  const guideResultCount = useMemo(() => countSectionItems(filteredSections), [filteredSections]);

  const setSearchQuery = useCallback((text: string) => {
    setSearchQueryState(text);
    if (text.trim().length > 0) {
      setActiveCategoryId(null);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQueryState('');
  }, []);

  const selectCategory = useCallback((categoryId: GuideCategoryId | null) => {
    setActiveCategoryId(categoryId);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    searchKey,
    hasSearch,
    highlightRegex,
    activeCategoryId,
    selectCategory,
    filteredFaqItems,
    searchedFaqCount: searchedFaqItems.length,
    categoryCounts,
    filteredSections,
    guideResultCount,
  };
}
