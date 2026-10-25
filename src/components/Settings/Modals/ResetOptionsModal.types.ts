export type ResetOptionType = 'dafYomi' | 'personalTrack' | 'readerPositions' | 'all';

export interface ResetOptionItem {
  id: ResetOptionType;
  title: string;
  description: string;
  icon: 'calendar-outline' | 'bookmark-outline' | 'navigate-outline' | 'trash-outline';
  isDestructiveAll?: boolean;
}

export interface ResetOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (type: ResetOptionType) => void;
}
