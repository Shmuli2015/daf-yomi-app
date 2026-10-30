import { GUIDE_SECTIONS } from '../../components/Guide/guideData';
import { RESET_ITEM } from '../settingsSearchCatalog';
import { matchesSetting } from '../settingsSearch';
import {
  getResetConfirmTexts,
  getResetContinueLabel,
  getResetSuccessToast,
  runResetAction,
  type ResetActions,
} from '../settingsReset';

function createActions(): ResetActions & Record<keyof ResetActions, jest.Mock> {
  return {
    resetDafYomiState: jest.fn(),
    resetPersonalTrackState: jest.fn(),
    clearReaderPositionsState: jest.fn(),
    clearSavedTextsState: jest.fn(),
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

  it('confirms that clearing saved texts keeps study marks and settings', () => {
    const texts = getResetConfirmTexts('savedTexts');
    expect(texts.title).toBe('אישור ניקוי קבצים שמורים');
    expect(texts.message).toContain('גמרא');
    expect(texts.message).toContain('סימוני הלימוד, הרצף וההגדרות יישמרו');
    expect(texts.message).not.toContain('מצב ההתחלתי');
  });

  it('uses the full reset warning only for a full reset', () => {
    expect(getResetConfirmTexts('all').message).toContain('מצב ההתחלתי');
    expect(getResetConfirmTexts('all').message).toContain('הטקסטים שהורדו');
    expect(getResetConfirmTexts(null).title).toBe('אישור איפוס כללי');
  });

  it('labels the continue button for each reset choice', () => {
    expect(getResetContinueLabel('savedTexts')).toBe('המשך לניקוי קבצים שמורים');
    expect(getResetContinueLabel('all')).toBe('המשך לאיפוס כללי');
  });

  it('runs only the reading-position clear', async () => {
    const actions = createActions();
    await runResetAction('readerPositions', actions);
    expect(actions.clearReaderPositionsState).toHaveBeenCalledTimes(1);
    expect(actions.resetDafYomiState).not.toHaveBeenCalled();
    expect(actions.resetPersonalTrackState).not.toHaveBeenCalled();
    expect(actions.clearSavedTextsState).not.toHaveBeenCalled();
    expect(actions.resetAllState).not.toHaveBeenCalled();
  });

  it('runs only the saved-texts clear', async () => {
    const actions = createActions();
    await runResetAction('savedTexts', actions);
    expect(actions.clearSavedTextsState).toHaveBeenCalledTimes(1);
    expect(actions.resetDafYomiState).not.toHaveBeenCalled();
    expect(actions.resetPersonalTrackState).not.toHaveBeenCalled();
    expect(actions.clearReaderPositionsState).not.toHaveBeenCalled();
    expect(actions.resetAllState).not.toHaveBeenCalled();
  });

  it.each([
    ['dafYomi', 'resetDafYomiState'],
    ['personalTrack', 'resetPersonalTrackState'],
  ] as const)('runs only %s', async (type, actionName) => {
    const actions = createActions();
    await runResetAction(type, actions);
    expect(actions[actionName]).toHaveBeenCalledTimes(1);
    expect(actions.clearReaderPositionsState).not.toHaveBeenCalled();
    expect(actions.clearSavedTextsState).not.toHaveBeenCalled();
    expect(actions.resetAllState).not.toHaveBeenCalled();
  });

  it('clears saved texts as part of a full reset', async () => {
    const actions = createActions();
    await runResetAction('all', actions);
    expect(actions.resetAllState).toHaveBeenCalledTimes(1);
    expect(actions.clearSavedTextsState).toHaveBeenCalledTimes(1);
    expect(actions.resetDafYomiState).not.toHaveBeenCalled();
    expect(actions.clearReaderPositionsState).not.toHaveBeenCalled();
  });

  it('reports every successful reset as a toast', () => {
    for (const type of [
      'dafYomi',
      'personalTrack',
      'readerPositions',
      'savedTexts',
      'all',
    ] as const) {
      const toast = getResetSuccessToast(type);
      expect(toast.toast).toBe(true);
      expect(toast.autoCloseMs).toBe(3000);
      expect(toast.iconName).toBe('checkmark-circle');
      expect(toast.title.length).toBeGreaterThan(0);
      expect(toast.message.length).toBeGreaterThan(0);
    }
    expect(getResetSuccessToast('readerPositions').message).toContain('סימוני הלימוד וההגדרות נשמרו');
    expect(getResetSuccessToast('savedTexts').message).toContain('סימוני הלימוד וההגדרות שלך נשמרו');
    expect(getResetSuccessToast('all').message).toContain('הטקסטים השמורים');
  });

  it('finds the reset setting by reading-position and cache words', () => {
    expect(matchesSetting('מיקום', RESET_ITEM)).toBe(true);
    expect(matchesSetting('מיקומי קריאה', RESET_ITEM)).toBe(true);
    expect(matchesSetting('קבצים שמורים', RESET_ITEM)).toBe(true);
    expect(matchesSetting('מטמון', RESET_ITEM)).toBe(true);
    expect(matchesSetting('גמרא', RESET_ITEM)).toBe(true);
  });

  it('documents five reset choices in the guide', () => {
    const settings = GUIDE_SECTIONS.find((section) => section.id === 'settings');
    const resetItem = settings?.items.find((item) => item.startsWith('[[איפוס נתונים]]'));
    expect(resetItem).toContain('5 אפשרויות');
    expect(resetItem).toContain('[[ניקוי מיקומי קריאה]]');
    expect(resetItem).toContain('[[ניקוי קבצים שמורים]]');
  });
});
