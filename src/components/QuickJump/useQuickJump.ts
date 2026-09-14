import { useState, useMemo, useCallback } from 'react';
import { SHAS_MASECHTOT, type Masechet } from '../../data/shas';
import { getMasechetDafim, doesMasechetEndOnAmudA } from '../../utils/shas';
import { triggerSelection } from '../../utils/haptics';

interface UseQuickJumpParams {
  initialMasechetEn?: string;
  onNavigate: (params: {
    masechetEn: string;
    masechetHe: string;
    dafNum: number;
    amud: 'a' | 'b';
  }) => void;
  onClose: () => void;
}

export function useQuickJump({ initialMasechetEn, onNavigate, onClose }: UseQuickJumpParams) {
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
    const dafim = getMasechetDafim(defaultMasechet.he);
    return dafim[0] ?? 2;
  });
  const [isDafDropdownOpen, setIsDafDropdownOpen] = useState(false);
  const [amud, setAmud] = useState<'a' | 'b'>('a');

  const dafList = useMemo(() => {
    return getMasechetDafim(selectedMasechet.he);
  }, [selectedMasechet]);

  const isAmudBAvailable = useMemo(() => {
    const lastDaf = dafList[dafList.length - 1];
    if (selectedDaf === lastDaf && doesMasechetEndOnAmudA(selectedMasechet.en)) {
      return false;
    }
    return true;
  }, [dafList, selectedDaf, selectedMasechet]);

  const filteredMasechtot = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SHAS_MASECHTOT;
    return SHAS_MASECHTOT.filter(
      (m) => m.he.includes(query) || m.en.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectMasechet = useCallback((masechet: Masechet) => {
    setSelectedMasechet(masechet);
    const masechetDafim = getMasechetDafim(masechet.he);
    const minDaf = masechetDafim[0] ?? 2;
    const maxDaf = masechetDafim[masechetDafim.length - 1] ?? minDaf;
    setSelectedDaf((prev) => {
      const nextDaf = prev < minDaf || prev > maxDaf ? minDaf : prev;
      if (nextDaf === maxDaf && doesMasechetEndOnAmudA(masechet.en)) {
        setAmud('a');
      }
      return nextDaf;
    });
    setIsDafDropdownOpen(false);
    void triggerSelection();
  }, []);

  const handleSelectDaf = useCallback(
    (daf: number) => {
      setSelectedDaf(daf);
      setIsDafDropdownOpen(false);
      const masechetDafim = getMasechetDafim(selectedMasechet.he);
      const maxDaf = masechetDafim[masechetDafim.length - 1];
      if (daf === maxDaf && doesMasechetEndOnAmudA(selectedMasechet.en)) {
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
      if (newAmud === 'b' && !isAmudBAvailable) {
        return;
      }
      setAmud(newAmud);
      void triggerSelection();
    },
    [isAmudBAvailable]
  );

  const handleSubmit = useCallback(() => {
    void triggerSelection();
    const finalAmud = !isAmudBAvailable ? 'a' : amud;
    onNavigate({
      masechetEn: selectedMasechet.en,
      masechetHe: selectedMasechet.he,
      dafNum: selectedDaf,
      amud: finalAmud,
    });
    onClose();
  }, [selectedMasechet, selectedDaf, amud, isAmudBAvailable, onNavigate, onClose]);

  return {
    selectedMasechet,
    searchQuery,
    setSearchQuery,
    selectedDaf,
    dafList,
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
