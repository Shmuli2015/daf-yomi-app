import { useState, useMemo, useCallback, useRef } from 'react';
import { SHAS_MASECHTOT, type Masechet } from '../../data/shas';
import { getReaderDafim, isAmudAvailable } from '../../utils/shas';
import { triggerSelection } from '../../utils/haptics';

interface UseQuickJumpParams {
  visible: boolean;
  initialMasechetEn?: string;
  initialDafNum?: number;
  initialAmud?: 'a' | 'b';
  onNavigate: (params: {
    masechetEn: string;
    masechetHe: string;
    dafNum: number;
    amud: 'a' | 'b';
  }) => void;
  onClose: () => void;
}

function resolveSelection(
  masechet: Masechet,
  dafNum?: number,
  amud?: 'a' | 'b',
) {
  const dafim = getReaderDafim(masechet.he);
  const nextDaf = dafNum != null && dafim.includes(dafNum) ? dafNum : (dafim[0] ?? 2);
  const nextAmud =
    amud && isAmudAvailable(masechet.en, nextDaf, amud)
      ? amud
      : isAmudAvailable(masechet.en, nextDaf, 'a')
        ? 'a'
        : 'b';
  return { nextDaf, nextAmud };
}

export function useQuickJump({
  visible,
  initialMasechetEn,
  initialDafNum,
  initialAmud,
  onNavigate,
  onClose,
}: UseQuickJumpParams) {
  const defaultMasechet = useMemo(() => {
    if (initialMasechetEn) {
      const match = SHAS_MASECHTOT.find((m) => m.en === initialMasechetEn);
      if (match) return match;
    }
    return SHAS_MASECHTOT[0];
  }, [initialMasechetEn]);

  const [selectedMasechet, setSelectedMasechet] = useState<Masechet>(defaultMasechet);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDaf, setSelectedDaf] = useState(() => {
    return resolveSelection(defaultMasechet, initialDafNum, initialAmud).nextDaf;
  });
  const [isDafDropdownOpen, setIsDafDropdownOpen] = useState(false);
  const [amud, setAmud] = useState<'a' | 'b'>(
    () => resolveSelection(defaultMasechet, initialDafNum, initialAmud).nextAmud,
  );
  const wasVisibleRef = useRef(visible);

  if (visible !== wasVisibleRef.current) {
    wasVisibleRef.current = visible;
    if (visible) {
      const match = initialMasechetEn
        ? SHAS_MASECHTOT.find((m) => m.en === initialMasechetEn)
        : undefined;
      const nextMasechet = match ?? defaultMasechet;
      const { nextDaf, nextAmud } = resolveSelection(nextMasechet, initialDafNum, initialAmud);
      setSelectedMasechet(nextMasechet);
      setSelectedDaf(nextDaf);
      setAmud(nextAmud);
    } else {
      setSearchQuery('');
      setIsDafDropdownOpen(false);
    }
  }

  const dafList = useMemo(() => {
    return getReaderDafim(selectedMasechet.he);
  }, [selectedMasechet]);

  const isAmudAAvailable = useMemo(
    () => isAmudAvailable(selectedMasechet.en, selectedDaf, 'a'),
    [selectedDaf, selectedMasechet],
  );

  const isAmudBAvailable = useMemo(
    () => isAmudAvailable(selectedMasechet.en, selectedDaf, 'b'),
    [selectedDaf, selectedMasechet],
  );

  const filteredMasechtot = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SHAS_MASECHTOT;
    return SHAS_MASECHTOT.filter(
      (m) => m.he.includes(query) || m.en.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectMasechet = useCallback((masechet: Masechet) => {
    setSelectedMasechet(masechet);
    const { nextDaf, nextAmud } = resolveSelection(masechet);
    setSelectedDaf(nextDaf);
    setAmud(nextAmud);
    setIsDafDropdownOpen(false);
    void triggerSelection();
  }, []);

  const handleSelectDaf = useCallback(
    (daf: number) => {
      setSelectedDaf(daf);
      setIsDafDropdownOpen(false);
      if (!isAmudAvailable(selectedMasechet.en, daf, 'a')) {
        setAmud('b');
      } else if (!isAmudAvailable(selectedMasechet.en, daf, 'b')) {
        setAmud('a');
      }
      void triggerSelection();
    },
    [selectedMasechet]
  );

  const toggleDafDropdown = useCallback(() => {
    setIsDafDropdownOpen((prev) => !prev);
    void triggerSelection();
  }, []);

  const handleSelectAmud = useCallback(
    (newAmud: 'a' | 'b') => {
      if (newAmud === 'a' && !isAmudAAvailable) {
        return;
      }
      if (newAmud === 'b' && !isAmudBAvailable) {
        return;
      }
      setAmud(newAmud);
      void triggerSelection();
    },
    [isAmudAAvailable, isAmudBAvailable]
  );

  const handleSubmit = useCallback(() => {
    void triggerSelection();
    const finalAmud = isAmudAvailable(selectedMasechet.en, selectedDaf, amud)
      ? amud
      : isAmudAAvailable
        ? 'a'
        : 'b';
    onNavigate({
      masechetEn: selectedMasechet.en,
      masechetHe: selectedMasechet.he,
      dafNum: selectedDaf,
      amud: finalAmud,
    });
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => {
        onClose();
      });
      return;
    }
    requestAnimationFrame(() => {
      onClose();
    });
  }, [selectedMasechet, selectedDaf, amud, isAmudAAvailable, onNavigate, onClose]);

  return {
    selectedMasechet,
    searchQuery,
    setSearchQuery,
    selectedDaf,
    dafList,
    isAmudAAvailable,
    isAmudBAvailable,
    isDafDropdownOpen,
    toggleDafDropdown,
    handleSelectDaf,
    amud,
    filteredMasechtot,
    handleSelectMasechet,
    handleSelectAmud,
    handleSubmit,
  };
}
