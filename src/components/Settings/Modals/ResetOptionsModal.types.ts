export type ResetOptionType =
  | 'dafYomi'
  | 'personalTrack'
  | 'readerPositions'
  | 'savedTexts'
  | 'all';

export interface ResetOptionItem {
  id: ResetOptionType;
  title: string;
  description: string;
  icon:
    | 'calendar-outline'
    | 'bookmark-outline'
    | 'navigate-outline'
    | 'folder-open-outline'
    | 'trash-outline';
  isDestructiveAll?: boolean;
}

export interface ResetOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (type: ResetOptionType) => void;
}
