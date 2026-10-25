import { GUIDE_SECTIONS } from '../../components/Guide/guideData';
import { RESET_ITEM } from '../settingsSearchCatalog';
import { matchesSetting } from '../settingsSearch';
import {
  getResetConfirmTexts,
  getResetSuccessToast,
  runResetAction,
  type ResetActions,
} from '../settingsReset';

function createActions(): ResetActions & Record<keyof ResetActions, jest.Mock> {
  return {
    resetDafYomiState: jest.fn(),
    resetPersonalTrackState: jest.fn(),
    clearReaderPositionsState: jest.fn(),
    resetAllState: jest.fn(),
  };
}

describe('settingsReset', () => {
  it('confirms that clearing reading positions keeps study marks and settings', () => {
    const texts = getResetConfirmTexts('readerPositions');
    expect(texts.title).toBe('אישור ניקוי מיקומי קריאה');
    expect(texts.message).toContain('מיקומי הקריאה השמורים');
    expect(texts.message).toContain('סימוני הלימוד וההגדרות יישמרו');
    expect(texts.message).not.toContain('מצב ההתחלתי');
  });

  it('uses the full reset warning only for a full reset', () => {
    expect(getResetConfirmTexts('all').message).toContain('מצב ההתחלתי');
    expect(getResetConfirmTexts(null).title).toBe('אישור איפוס כללי');
  });

  it('runs only the reading-position clear', () => {
    const actions = createActions();
    runResetAction('readerPositions', actions);
    expect(actions.clearReaderPositionsState).toHaveBeenCalledTimes(1);
    expect(actions.resetDafYomiState).not.toHaveBeenCalled();
    expect(actions.resetPersonalTrackState).not.toHaveBeenCalled();
    expect(actions.resetAllState).not.toHaveBeenCalled();
  });

  it.each([
    ['dafYomi', 'resetDafYomiState'],
    ['personalTrack', 'resetPersonalTrackState'],
    ['all', 'resetAllState'],
  ] as const)('runs only %s', (type, actionName) => {
    const actions = createActions();
    runResetAction(type, actions);
    expect(actions[actionName]).toHaveBeenCalledTimes(1);
    expect(actions.clearReaderPositionsState).not.toHaveBeenCalled();
  });

  it('reports every successful reset as a toast', () => {
    for (const type of ['dafYomi', 'personalTrack', 'readerPositions', 'all'] as const) {
      const toast = getResetSuccessToast(type);
      expect(toast.toast).toBe(true);
      expect(toast.autoCloseMs).toBe(3000);
      expect(toast.iconName).toBe('checkmark-circle');
      expect(toast.title.length).toBeGreaterThan(0);
      expect(toast.message.length).toBeGreaterThan(0);
    }
    expect(getResetSuccessToast('readerPositions').message).toContain('סימוני הלימוד וההגדרות נשמרו');
  });

  it('finds the reset setting by reading-position words', () => {
    expect(matchesSetting('מיקום', RESET_ITEM)).toBe(true);
    expect(matchesSetting('מיקומי קריאה', RESET_ITEM)).toBe(true);
  });

  it('documents four reset choices in the guide', () => {
    const settings = GUIDE_SECTIONS.find((section) => section.id === 'settings');
    const resetItem = settings?.items.find((item) => item.includes('[[איפוס נתונים]]'));
    expect(resetItem).toContain('4 אפשרויות');
    expect(resetItem).toContain('[[ניקוי מיקומי קריאה]]');
  });
});
