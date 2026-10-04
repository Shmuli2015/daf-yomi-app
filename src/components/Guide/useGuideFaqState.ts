import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GuideFaqItemData } from './guideFaqData';

export function useGuideFaqState(
  faqItems: GuideFaqItemData[],
  hasSearch: boolean,
  searchKey: string,
) {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [collapsedInSearch, setCollapsedInSearch] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsedInSearch({});
  }, [searchKey]);

  const toggleFaq = useCallback(
    (id: string) => {
      if (hasSearch) {
        setCollapsedInSearch((prev) => ({
          ...prev,
          [id]: !prev[id],
        }));
        return;
      }

      setExpandedMap((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    },
    [hasSearch],
  );

  const expandFaq = useCallback((id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: true }));
  }, []);

  const handleExpandAllFaq = useCallback(() => {
    if (hasSearch) {
      setCollapsedInSearch({});
      return;
    }
    const allExpanded = faqItems.reduce((acc, item) => {
      acc[item.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedMap(allExpanded);
  }, [hasSearch, faqItems]);

  const handleCollapseAllFaq = useCallback(() => {
    if (hasSearch) {
      const allCollapsed = faqItems.reduce((acc, item) => {
        acc[item.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setCollapsedInSearch(allCollapsed);
      return;
    }
    setExpandedMap({});
  }, [hasSearch, faqItems]);

  const isFaqExpanded = useCallback(
    (id: string) => {
      if (hasSearch) {
        return !collapsedInSearch[id];
      }
      return !!expandedMap[id];
    },
    [hasSearch, collapsedInSearch, expandedMap],
  );

  const expandedCount = useMemo(() => {
    return faqItems.filter((item) => isFaqExpanded(item.id)).length;
  }, [faqItems, isFaqExpanded]);

  const allFaqExpanded = faqItems.length > 0 && expandedCount === faqItems.length;
  const noneFaqExpanded = expandedCount === 0;

  return useMemo(
    () => ({
      toggleFaq,
      expandFaq,
      handleExpandAllFaq,
      handleCollapseAllFaq,
      allFaqExpanded,
      noneFaqExpanded,
      isFaqExpanded,
    }),
    [
      toggleFaq,
      expandFaq,
      handleExpandAllFaq,
      handleCollapseAllFaq,
      allFaqExpanded,
      noneFaqExpanded,
      isFaqExpanded,
    ],
  );
}
