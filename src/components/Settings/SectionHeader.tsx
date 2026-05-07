import React from 'react';
import { Text } from 'react-native';

export const SectionHeader = ({ title }: { title: string }) => (
  <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest px-4 mb-2 mt-6 text-right">
    {title}
  </Text>
);
