export type TzuratPageContent = {
  kind: 'pdf' | 'image';
  uri: string;
  remoteUrl?: string;
};

export interface TzuratHadafViewerProps {
  page: TzuratPageContent | null;
  loading: boolean;
  error: string | null;
  onOpenSefaria?: () => void;
  onRetry?: () => void;
}
