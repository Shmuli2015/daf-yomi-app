import type { ResetOptionType } from '../components/Settings/ResetOptionsModal.types';

export interface ResetTexts {
  title: string;
  message: string;
}

export function getResetConfirmTexts(type: ResetOptionType | null): ResetTexts {
  switch (type) {
    case 'dafYomi':
      return {
        title: 'אישור איפוס הדף היומי',
        message: 'האם אתה בטוח שברצונך למחוק את כל היסטוריית הדף היומי? נתוני המסלול האישי וההגדרות יישמרו. פעולה זו אינה ניתנת לביטול.',
      };
    case 'personalTrack':
      return {
        title: 'אישור איפוס מסלול אישי',
        message: 'האם אתה בטוח שברצונך למחוק את כל סימוני המסלול האישי? היסטוריית הדף היומי וההגדרות יישמרו. פעולה זו אינה ניתנת לביטול.',
      };
    case 'all':
    default:
      return {
        title: 'אישור איפוס כללי',
        message: 'האם אתה בטוח שברצונך למחוק את כל הנתונים ולאפס את כל הגדרות האפליקציה למצב ההתחלתי? פעולה זו אינה ניתנת לביטול.',
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
    case 'all':
    default:
      return {
        title: 'איפוס כללי הושלם',
        message: 'כל הנתונים וההגדרות נמחקו בהצלחה. האפליקציה חזרה למצבה ההתחלתי.',
      };
  }
}
