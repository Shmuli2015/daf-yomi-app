import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../theme';
import { createSupportFormModalStyles } from './SupportFormModal.styles';

type SupportFormFieldLabelProps = {
  children: string;
  required?: boolean;
};

export default function SupportFormFieldLabel({
  children,
  required = false,
}: SupportFormFieldLabelProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSupportFormModalStyles(theme), [theme]);

  return (
    <Text style={styles.label}>
      {children}
      {required ? <Text style={styles.requiredMark}> *</Text> : null}
    </Text>
  );
}
