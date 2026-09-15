import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SHAS_MASECHTOT, type Masechet } from '../../data/shas';
import { getReaderDafim, isAmudAvailable } from '../../utils/shas';
import { triggerSelection } from '../../utils/haptics';

interface UseQuickJumpParams {
  visible: boolean;
  initialMasechetEn?: string;
  onNavigate: (params: {
    masechetEn: string;
    masechetHe: string;
    dafNum: number;
    amud: 'a' | 'b';
  }) => void;
  onClose: () => void;
}

export function useQuickJump({ visible, initialMasechetEn, onNavigate, onClose }: UseQuickJumpParams) {
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
    const dafim = getReaderDafim(defaultMasechet.he);
    return dafim[0] ?? 2;
  });
  const [isDafDropdownOpen, setIsDafDropdownOpen] = useState(false);
  const [amud, setAmud] = useState<'a' | 'b'>(() =>
    isAmudAvailable(defaultMasechet.en, getReaderDafim(defaultMasechet.he)[0] ?? 2, 'a')
      ? 'a'
      : 'b',
  );
  const hasUserSelectedMasechet = useRef(false);

  useEffect(() => {
    if (visible) return;
    setSearchQuery('');
    setIsDafDropdownOpen(false);
  }, [visible]);

  useEffect(() => {
    if (hasUserSelectedMasechet.current) return;
    if (!initialMasechetEn) return;
    const match = SHAS_MASECHTOT.find((m) => m.en === initialMasechetEn);
    if (match) setSelectedMasechet(match);
  }, [initialMasechetEn]);

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
    hasUserSelectedMasechet.current = true;
    setSelectedMasechet(masechet);
    const firstDaf = getReaderDafim(masechet.he)[0] ?? 2;
    setSelectedDaf(firstDaf);
    setAmud(isAmudAvailable(masechet.en, firstDaf, 'a') ? 'a' : 'b');
    setIsDafDropdownOpen(false);
    void triggerSelection();
  }, []);

  const handleSelectDaf = useCallback(
    (daf: number) => {
      setSelectedDaf(daf);
      setIsDafDropdownOpen(false);
      const nextDaf = daf;
      if (!isAmudAvailable(selectedMasechet.en, nextDaf, 'a')) {
        setAmud('b');
      } else if (!isAmudAvailable(selectedMasechet.en, nextDaf, 'b')) {
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
    onClose();
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
