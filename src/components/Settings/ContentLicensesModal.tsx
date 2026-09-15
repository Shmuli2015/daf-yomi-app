import React, { useCallback, useMemo } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../BottomSheetModal';
import { useTheme } from '../../theme';
import {
  CONTENT_LICENSES,
  NON_COMMERCIAL_NOTE,
  SEFARIA_INDEPENDENCE_NOTE,
} from '../../data/contentLicenses';
import PoweredBySefariaBadge from './PoweredBySefariaBadge';
import { createContentLicensesModalStyles } from './ContentLicensesModal.styles';

interface ContentLicensesModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ContentLicensesModal({ visible, onClose }: ContentLicensesModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createContentLicensesModalStyles(theme), [theme]);

  const openLink = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      return;
    }
  }, []);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleGroup}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="ribbon-outline" size={20} color={theme.colors.accent} />
            </View>
            <Text style={styles.title}>מקורות ורישיונות</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
        >
          <Text style={styles.intro}>
            הטקסטים והדפים באפליקציה מגיעים ממקורות חיצוניים, כל אחד בתנאי הרישיון שלו.
          </Text>

          {CONTENT_LICENSES.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <View style={styles.licenseBadge}>
                  <Text style={styles.licenseBadgeText}>{entry.licenseLabel}</Text>
                </View>
              </View>

              <Text style={styles.entryText}>{entry.attribution}</Text>

              <View style={styles.linkRow}>
                {entry.links.map((link) => (
                  <TouchableOpacity
                    key={link.url}
                    style={styles.linkChip}
                    onPress={() => openLink(link.url)}
                    activeOpacity={0.7}
                    accessibilityRole="link"
                    accessibilityLabel={link.label}
                  >
                    <Ionicons name="open-outline" size={13} color={theme.colors.accent} />
                    <Text style={styles.linkChipText}>{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.noteRow}>
            <Ionicons name="gift-outline" size={15} color={theme.colors.success} />
            <Text style={styles.noteText}>{NON_COMMERCIAL_NOTE}</Text>
          </View>

          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={15} color={theme.colors.textMuted} />
            <Text style={styles.noteText}>{SEFARIA_INDEPENDENCE_NOTE}</Text>
          </View>

          <View style={styles.badgeRow}>
            <PoweredBySefariaBadge />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.closeAction} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.closeActionText}>הבנתי</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
