export interface ClearCacheModalProps {
  visible: boolean;
  formattedSize: string;
  isClearing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
