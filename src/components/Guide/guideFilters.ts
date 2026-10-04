import type { GuideSectionData } from './guideData';
import type { GuideFaqItemData } from './guideFaqData';
import { GUIDE_CATEGORIES, getGuideCategory, type GuideCategoryId } from './guideCategories';
import { matchesAllTokens } from './guideSearchUtils';

export type GuideCategoryCounts = Record<GuideCategoryId, number>;

export interface GuideFaqGroup {
  categoryId: GuideCategoryId;
  items: GuideFaqItemData[];
}

export function filterFaqItems(items: GuideFaqItemData[], tokens: string[]): GuideFaqItemData[] {
  if (tokens.length === 0) return items;
  return items.filter((item) =>
    matchesAllTokens(
      `${item.question} ${item.answer} ${getGuideCategory(item.categoryId).label}`,
      tokens,
    ),
  );
}

export function filterGuideSections(
  sections: GuideSectionData[],
  tokens: string[],
): GuideSectionData[] {
  if (tokens.length === 0) return sections;
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => matchesAllTokens(`${section.title} ${item}`, tokens)),
    }))
    .filter((section) => section.items.length > 0);
}

export function countFaqItemsByCategory(items: GuideFaqItemData[]): GuideCategoryCounts {
  const counts = GUIDE_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = 0;
    return acc;
  }, {} as GuideCategoryCounts);
  items.forEach((item) => {
    counts[item.categoryId] += 1;
  });
  return counts;
}

export function groupFaqItemsByCategory(items: GuideFaqItemData[]): GuideFaqGroup[] {
  return GUIDE_CATEGORIES.map((category) => ({
    categoryId: category.id,
    items: items.filter((item) => item.categoryId === category.id),
  })).filter((group) => group.items.length > 0);
}

export function countSectionItems(sections: GuideSectionData[]): number {
  return sections.reduce((total, section) => total + section.items.length, 0);
}
