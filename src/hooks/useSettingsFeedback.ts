import { useState, useEffect, useCallback } from 'react';
import type { InfoModalIconName } from '../components/InfoModal';

export interface SettingsFeedback {
  title: string;
  message: string;
  emphasis?: string;
  iconName?: InfoModalIconName;
  actionLabel?: string;
  compact?: boolean;
  autoCloseMs?: number;
}

export interface UseSettingsFeedbackReturn {
  feedback: SettingsFeedback | null;
  showFeedback: (feedback: SettingsFeedback) => void;
  clearFeedback: () => void;
}

export function useSettingsFeedback(): UseSettingsFeedbackReturn {
  const [feedback, setFeedback] = useState<SettingsFeedback | null>(null);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const showFeedback = useCallback((next: SettingsFeedback) => setFeedback(next), []);

  useEffect(() => {
    const ms = feedback?.autoCloseMs;
    if (ms == null || ms <= 0) return;
    const timeoutId = setTimeout(() => setFeedback(null), ms);
    return () => clearTimeout(timeoutId);
  }, [feedback]);

  return { feedback, showFeedback, clearFeedback };
}
