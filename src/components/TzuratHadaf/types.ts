export type TzuratPageContent = {
  kind: 'pdf' | 'image';
  uri: string;
  remoteUrl?: string;
};

export interface TzuratHadafViewerProps {
  page: TzuratPageContent | null;
  loading: boolean;
  error: string | null;
  layoutKey?: string;
  isLandscape?: boolean;
  onToggleOrientation?: () => void;
  onOpenSefaria?: () => void;
  onRetry?: () => void;
}
