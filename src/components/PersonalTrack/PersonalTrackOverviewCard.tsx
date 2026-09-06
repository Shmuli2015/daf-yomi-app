import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

interface PersonalTrackOverviewCardProps {
  totalLearned: number;
  onOpenPicker: () => void;
}

export default function PersonalTrackOverviewCard({
  totalLearned,
  onOpenPicker,
}: PersonalTrackOverviewCardProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (totalLearned === 0) {
    return (
      <View style={styles.outerContainer}>
        <TouchableOpacity
          style={styles.emptyContainer}
          activeOpacity={0.85}
          onPress={onOpenPicker}
        >
          <LinearGradient
            colors={[theme.colors.accent + '0C', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.emptyHeaderRow}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="bookmark-outline" size={22} color={theme.colors.accent} />
            </View>
            <View style={styles.emptyTitleSection}>
              <Text style={styles.emptyTitle}>המסלול האישי שלי</Text>
              <Text style={styles.emptySubtitle}>מעקב עצמאי אחר מסכת לבחירתך בקצב שלך</Text>
            </View>
          </View>

          <View style={styles.addBtn}>
            <Ionicons name="add-circle" size={18} color="#FFF" />
            <Text style={styles.addBtnText}>בחר מסכת ללימוד</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.accent + '10', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="bookmark" size={18} color={theme.colors.accent} />
            </View>
            <View>
              <Text style={styles.bannerTag}>לימוד אישי</Text>
              <Text style={styles.masechetTitle}>מעקב ש״ס אישי</Text>
            </View>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalLearned} דפים נלמדו</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryActionBtn}
          onPress={onOpenPicker}
          activeOpacity={0.8}
        >
          <Ionicons name="apps-outline" size={16} color="#FFF" />
          <Text style={styles.primaryActionText}>לכל מסכתות הש״ס</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    outerContainer: {
      marginHorizontal: 20,
    },
    emptyContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.accentBorder || theme.colors.border,
      borderStyle: 'dashed',
      overflow: 'hidden',
      ...theme.shadow.card,
    },
    emptyHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16,
    },
    emptyIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitleSection: {
      flex: 1,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginTop: 2,
    },
    addBtn: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addBtnText: {
      color: '#FFF',
      fontSize: 14,
      fontWeight: '800',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 28,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.shadow.cardMedium,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconContainer: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    bannerTag: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.accent,
      textTransform: 'uppercase',
    },
    masechetTitle: {
      fontSize: 17,
      fontWeight: '900',
      color: theme.colors.textPrimary,
    },
    badge: {
      backgroundColor: theme.colors.accentLight + '50',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.accent,
    },
    chipsSection: {
      marginBottom: 12,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    primaryActionBtn: {
      flex: 1,
      backgroundColor: theme.colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primaryActionText: {
      color: '#FFF',
      fontSize: 13,
      fontWeight: '700',
    },
  });
