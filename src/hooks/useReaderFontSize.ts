import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  clampReaderFontSize,
  decreaseReaderFontSize,
  increaseReaderFontSize,
  READER_FONT_SIZE_DEFAULT,
} from '../utils/readerFontSize';

export function useReaderFontSize() {
  const storedSize = useAppStore((state) => state.settings?.reader_font_size);
  const fontSize = clampReaderFontSize(storedSize ?? READER_FONT_SIZE_DEFAULT);

  const increase = useCallback(() => {
    useAppStore.getState().updateReaderFontSize(increaseReaderFontSize(fontSize));
  }, [fontSize]);

  const decrease = useCallback(() => {
    useAppStore.getState().updateReaderFontSize(decreaseReaderFontSize(fontSize));
  }, [fontSize]);

  return { fontSize, increase, decrease };
}
