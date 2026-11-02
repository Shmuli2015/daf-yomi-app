import type { DailyRecord } from '../../db/database';
import {
  formatPartialAmudLabel,
  formatProgressCount,
  getPartialAmud,
  getRecordProgress,
  getStudyStatus,
  resolveAmudMark,
  statusToPercentage,
} from '../dafStatus';

function record(overrides: Partial<DailyRecord> = {}): DailyRecord {
  return {
    id: 1,
    date: '2026-01-15',
    masechet: 'ברכות',
    daf: "דף ב'",
    status: 'learned',
    percentage: 100,
    amud: null,
    learnedAt: '2026-01-15T10:00:00.000Z',
    ...overrides,
  };
}

describe('dafStatus', () => {
  describe('getStudyStatus', () => {
    it('returns none when the record is missing or not learned or partial', () => {
      expect(getStudyStatus(null)).toBe('none');
      expect(getStudyStatus(undefined)).toBe('none');
      expect(getStudyStatus({ status: 'missed' })).toBe('none');
      expect(getStudyStatus({ status: 'unknown' })).toBe('none');
    });

    it('returns partial and learned as stored', () => {
      expect(getStudyStatus({ status: 'partial' })).toBe('partial');
      expect(getStudyStatus({ status: 'learned' })).toBe('learned');
    });
  });

  describe('getRecordProgress', () => {
    it('returns 0 when there is no record or the daf is missed', () => {
      expect(getRecordProgress(null)).toBe(0);
      expect(getRecordProgress(undefined)).toBe(0);
      expect(getRecordProgress(record({ status: 'missed', percentage: 0 }))).toBe(0);
    });

    it('returns 1 for a fully learned daf', () => {
      expect(getRecordProgress(record({ status: 'learned', percentage: 100 }))).toBe(1);
    });

    it('uses percentage for a partial daf and defaults to 50 when omitted', () => {
      expect(getRecordProgress(record({ status: 'partial', percentage: 50 }))).toBe(0.5);
      expect(getRecordProgress(record({ status: 'partial', percentage: 0 }))).toBe(0.5);
    });
  });

  describe('getPartialAmud', () => {
    it('returns the amud only when status is partial', () => {
      expect(getPartialAmud(null)).toBeNull();
      expect(getPartialAmud({ status: 'learned', amud: 'a' })).toBeNull();
      expect(getPartialAmud({ status: 'partial', amud: 'b' })).toBe('b');
      expect(getPartialAmud({ status: 'partial' })).toBeNull();
    });
  });

  describe('statusToPercentage', () => {
    it('maps learned, partial, and missed to 100, 50, and 0', () => {
      expect(statusToPercentage('learned')).toBe(100);
      expect(statusToPercentage('partial')).toBe(50);
      expect(statusToPercentage('missed')).toBe(0);
    });
  });

  describe('formatProgressCount', () => {
    it('keeps whole numbers and shows one decimal for fractions', () => {
      expect(formatProgressCount(3)).toBe('3');
      expect(formatProgressCount(3.0)).toBe('3');
      expect(formatProgressCount(3.5)).toBe('3.5');
    });
  });

  describe('formatPartialAmudLabel', () => {
    it('labels amud b as ב and everything else as א', () => {
      expect(formatPartialAmudLabel('b')).toBe('עמוד ב׳ נלמד');
      expect(formatPartialAmudLabel('a')).toBe('עמוד א׳ נלמד');
      expect(formatPartialAmudLabel(null)).toBe('עמוד א׳ נלמד');
      expect(formatPartialAmudLabel(undefined)).toBe('עמוד א׳ נלמד');
    });
  });

  describe('resolveAmudMark', () => {
    it('always stores a single amud as partial at 50 percent', () => {
      expect(resolveAmudMark(null, 'a')).toEqual({
        status: 'partial',
        percentage: 50,
        amud: 'a',
      });
      expect(resolveAmudMark({ status: 'learned', amud: 'a' }, 'b')).toEqual({
        status: 'partial',
        percentage: 50,
        amud: 'b',
      });
      expect(resolveAmudMark({ status: 'partial', amud: 'a' }, 'b')).toEqual({
        status: 'partial',
        percentage: 50,
        amud: 'b',
      });
    });
  });
});
