import React from 'react';
import type { GuideModalProps } from './GuideModal';

export default function GuideModalGate(props: GuideModalProps) {
  if (!props.visible) {
    return null;
  }
  const GuideModal = require('./GuideModal').default as React.ComponentType<GuideModalProps>;
  return <GuideModal {...props} />;
}
