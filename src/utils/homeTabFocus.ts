type HomeTabFocusListener = () => void;

let listener: HomeTabFocusListener | null = null;

export function subscribeHomeTabFocus(next: HomeTabFocusListener): () => void {
  listener = next;
  return () => {
    if (listener === next) {
      listener = null;
    }
  };
}

export function requestHomeTabFocus(): void {
  listener?.();
}
