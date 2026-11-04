import React from 'react';
import BottomSheetModal from './BottomSheetModal';
import DafMarkMenuContent, { type DafMarkMenuContentProps } from './DafMarkMenuContent';

interface DafMarkMenuModalProps extends DafMarkMenuContentProps {
  visible: boolean;
}

export default function DafMarkMenuModal({ visible, ...contentProps }: DafMarkMenuModalProps) {
  return (
    <BottomSheetModal visible={visible} onClose={contentProps.onCancel}>
      <DafMarkMenuContent {...contentProps} />
    </BottomSheetModal>
  );
}
