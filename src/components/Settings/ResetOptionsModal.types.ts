export type ResetOptionType = 'dafYomi' | 'personalTrack' | 'all';

export interface ResetOptionItem {
  id: ResetOptionType;
  title: string;
  description: string;
  icon: 'calendar-outline' | 'bookmark-outline' | 'trash-outline';
  isDestructiveAll?: boolean;
}

export interface ResetOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (type: ResetOptionType) => void;
}
