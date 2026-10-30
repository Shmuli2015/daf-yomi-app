import type { ResetOptionType } from '../components/Settings/Modals/ResetOptionsModal.types';

export interface ResetTexts {
  title: string;
  message: string;
}

export interface ResetActions {
  resetDafYomiState: () => void;
  resetPersonalTrackState: () => void;
  clearReaderPositionsState: () => void;
  clearSavedTextsState: () => void | Promise<void>;
  resetAllState: () => void;
}

export interface ResetSuccessToast extends ResetTexts {
  iconName: 'checkmark-circle';
  toast: true;
  autoCloseMs: 3000;
}

export function getResetConfirmTexts(type: ResetOptionType | null): ResetTexts {
  switch (type) {
    case 'dafYomi':
      return {
        title: 'אישור איפוס הדף היומי',
        message: 'פעולה זו תמחק את כל היסטוריית הדף היומי. נתוני המסלול האישי וההגדרות יישמרו. פעולה זו אינה ניתנת לביטול.',
      };
    case 'personalTrack':
      return {
        title: 'אישור איפוס מסלול אישי',
        message: 'פעולה זו תמחק את כל סימוני המסלול האישי. היסטוריית הדף היומי וההגדרות יישמרו. פעולה זו אינה ניתנת לביטול.',
      };
    case 'readerPositions':
      return {
        title: 'אישור ניקוי מיקומי קריאה',
        message: 'פעולה זו תמחק את מיקומי הקריאה השמורים בכל הדפים. סימוני הלימוד וההגדרות יישמרו. פעולה זו אינה ניתנת לביטול.',
      };
    case 'savedTexts':
      return {
        title: 'אישור ניקוי קבצים שמורים',
        message: 'פעולה זו תמחק טקסטים של גמרא, שטיינזלץ וחברותא שהורדו למכשיר. סימוני הלימוד, הרצף וההגדרות יישמרו. פעולה זו אינה ניתנת לביטול.',
      };
    case 'all':
    default:
      return {
        title: 'אישור איפוס כללי',
        message: 'פעולה זו תמחק את כל הנתונים, את הטקסטים שהורדו למכשיר, ותאפס את כל הגדרות האפליקציה למצב ההתחלתי. פעולה זו אינה ניתנת לביטול.',
      };
  }
}

export function getResetSuccessFeedback(type: ResetOptionType): ResetTexts {
  switch (type) {
    case 'dafYomi':
      return {
        title: 'איפוס הדף היומי הושלם',
        message: 'כל סימוני הדף היומי והרצף נמחקו בהצלחה. המסלול האישי וההגדרות נשמרו.',
      };
    case 'personalTrack':
      return {
        title: 'איפוס מסלול אישי הושלם',
        message: 'כל נתוני והתקדמות המסלול האישי נמחקו בהצלחה. נתוני הדף היומי וההגדרות נשמרו.',
      };
    case 'readerPositions':
      return {
        title: 'מיקומי הקריאה נוקו',
        message: 'כל מיקומי הקריאה השמורים נמחקו. סימוני הלימוד וההגדרות נשמרו.',
      };
    case 'savedTexts':
      return {
        title: 'הקבצים השמורים נוקו',
        message: 'כל הטקסטים השמורים נמחקו בהצלחה. סימוני הלימוד וההגדרות שלך נשמרו.',
      };
    case 'all':
    default:
      return {
        title: 'איפוס כללי הושלם',
        message: 'כל הנתונים, ההגדרות והטקסטים השמורים נמחקו בהצלחה. האפליקציה חזרה למצבה ההתחלתי.',
      };
  }
}

export function getResetContinueLabel(type: ResetOptionType): string {
  switch (type) {
    case 'dafYomi':
      return 'המשך לאיפוס דף יומי';
    case 'personalTrack':
      return 'המשך לאיפוס מסלול אישי';
    case 'readerPositions':
      return 'המשך לניקוי מיקומי קריאה';
    case 'savedTexts':
      return 'המשך לניקוי קבצים שמורים';
    case 'all':
      return 'המשך לאיפוס כללי';
  }
}

export async function runResetAction(type: ResetOptionType, actions: ResetActions): Promise<void> {
  switch (type) {
    case 'dafYomi':
      actions.resetDafYomiState();
      return;
    case 'personalTrack':
      actions.resetPersonalTrackState();
      return;
    case 'readerPositions':
      actions.clearReaderPositionsState();
      return;
    case 'savedTexts':
      await actions.clearSavedTextsState();
      return;
    case 'all':
      actions.resetAllState();
      await actions.clearSavedTextsState();
      return;
  }
}

export function getResetSuccessToast(type: ResetOptionType): ResetSuccessToast {
  const success = getResetSuccessFeedback(type);
  return {
    title: success.title,
    message: success.message,
    iconName: 'checkmark-circle',
    toast: true,
    autoCloseMs: 3000,
  };
}
