import { buildCommentaryFilterTabs, formatCommentaryBadgeLabel } from '../commentaryFilters';
import type { SefariaCommentaryItem } from '../../services/sefariaTextApi';

describe('commentaryFilters', () => {
  describe('formatCommentaryBadgeLabel', () => {
    it('returns empty string when list is empty', () => {
      expect(formatCommentaryBadgeLabel([])).toBe('');
    });

    it('formats single commentator label', () => {
      const items = [{ titleHe: 'רש״י' }] as SefariaCommentaryItem[];
      expect(formatCommentaryBadgeLabel(items)).toBe('פירוש רש״י');
    });

    it('formats multiple commentators label', () => {
      const items = [
        { titleHe: 'רש״י' },
        { titleHe: 'תוספות' },
      ] as SefariaCommentaryItem[];
      expect(formatCommentaryBadgeLabel(items)).toBe('2 פירושים (רש״י, תוספות)');
    });
  });

  describe('buildCommentaryFilterTabs', () => {
    it('always includes all tab first', () => {
      const tabs = buildCommentaryFilterTabs([]);
      expect(tabs).toEqual([{ id: 'all', label: 'הכל (0)' }]);
    });

    it('orders classic commentators correctly', () => {
      const items = [
        { commentator: 'tosafot' },
        { commentator: 'rashi' },
      ] as SefariaCommentaryItem[];
      const tabs = buildCommentaryFilterTabs(items);
      expect(tabs[0]).toEqual({ id: 'all', label: 'הכל (2)' });
      expect(tabs[1].id).toBe('rashi');
      expect(tabs[2].id).toBe('tosafot');
    });
  });
});
