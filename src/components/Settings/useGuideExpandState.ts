import { useCallback, useEffect, useMemo, useState } from 'react';
import { GUIDE_SECTIONS } from './guideData';

const DEFAULT_EXPANDED_MAP: Record<string, boolean> = { home: true };

function createAllExpandedMap(): Record<string, boolean> {
  return GUIDE_SECTIONS.reduce((acc, sec) => {
    acc[sec.id] = true;
    return acc;
  }, {} as Record<string, boolean>);
}

export function useGuideExpandState(hasSearch: boolean, searchKey: string) {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(DEFAULT_EXPANDED_MAP);
  const [collapsedInSearch, setCollapsedInSearch] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setCollapsedInSearch({});
  }, [searchKey]);

  const toggleSection = useCallback(
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

  const handleExpandAll = useCallback(() => {
    setExpandedMap(createAllExpandedMap());
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedMap({});
  }, []);

  const expandedCount = GUIDE_SECTIONS.filter((sec) => expandedMap[sec.id]).length;
  const allExpanded = expandedCount === GUIDE_SECTIONS.length;
  const noneExpanded = expandedCount === 0;

  const isSectionExpanded = useCallback(
    (id: string) => (hasSearch ? !collapsedInSearch[id] : !!expandedMap[id]),
    [hasSearch, collapsedInSearch, expandedMap],
  );

  return useMemo(
    () => ({
      toggleSection,
      handleExpandAll,
      handleCollapseAll,
      allExpanded,
      noneExpanded,
      isSectionExpanded,
    }),
    [
      toggleSection,
      handleExpandAll,
      handleCollapseAll,
      allExpanded,
      noneExpanded,
      isSectionExpanded,
    ],
  );
}
