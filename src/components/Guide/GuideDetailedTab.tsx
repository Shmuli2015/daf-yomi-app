import React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type { GuideSectionData } from './guideData';
import GuideQuickNav from './GuideQuickNav';
import GuideExpandControls from './GuideExpandControls';
import GuideSection from './GuideSection';
import GuideEmptyState from './GuideEmptyState';

interface GuideDetailedTabProps {
  sections: GuideSectionData[];
  hasSearch: boolean;
  searchQuery: string;
  onClearSearch: () => void;
  faqResultCount: number;
  onSwitchToFaq: () => void;
  onAskSupport: (subject: string) => void;
  isSectionExpanded: (id: string) => boolean;
  onToggleSection: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  allExpanded: boolean;
  noneExpanded: boolean;
  onSelectQuickNav: (sectionId: string) => void;
  highlightRegex?: RegExp | null;
  onRegisterAnchor?: (id: string, event: LayoutChangeEvent) => void;
}

export function GuideDetailedTab({
  sections,
  hasSearch,
  searchQuery,
  onClearSearch,
  faqResultCount,
  onSwitchToFaq,
  onAskSupport,
  isSectionExpanded,
  onToggleSection,
  onExpandAll,
  onCollapseAll,
  allExpanded,
  noneExpanded,
  onSelectQuickNav,
  highlightRegex,
  onRegisterAnchor,
}: GuideDetailedTabProps) {
  if (sections.length === 0) {
    return (
      <GuideEmptyState
        searchQuery={searchQuery}
        onClearSearch={onClearSearch}
        otherTabLabel="שאלות נפוצות"
        otherTabCount={faqResultCount}
        onSwitchTab={onSwitchToFaq}
        onAskSupport={onAskSupport}
      />
    );
  }

  return (
    <View style={{ width: '100%', direction: 'rtl' }}>
      {!hasSearch && <GuideQuickNav onSelectSection={onSelectQuickNav} />}

      {!hasSearch && (
        <GuideExpandControls
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
          allExpanded={allExpanded}
          noneExpanded={noneExpanded}
        />
      )}

      {sections.map((section) => (
        <GuideSection
          key={section.id}
          id={section.id}
          icon={section.icon}
          title={section.title}
          subtitle={section.subtitle}
          items={section.items}
          isExpanded={isSectionExpanded(section.id)}
          onToggle={onToggleSection}
          highlightRegex={highlightRegex}
          onLayout={
            onRegisterAnchor
              ? (event) => onRegisterAnchor(section.id, event)
              : undefined
          }
        />
      ))}
    </View>
  );
}

export default GuideDetailedTab;
