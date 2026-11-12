import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { AppState, View, Text, TouchableOpacity, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme';
import { getRandomQuoteItem, pickAnotherQuote, formatQuote, DafYomiQuote } from '../../utils/quotes';
import { triggerImpact, triggerSuccess } from '../../utils/haptics';
import { useDailyQuoteAnimation } from '../../hooks/useDailyQuoteAnimation';
import { createHomeDailyQuoteCardStyles } from './HomeDailyQuoteCard.styles';

const HomeDailyQuoteCard = React.memo(function HomeDailyQuoteCard() {
  const theme = useTheme();
  const styles = useMemo(() => createHomeDailyQuoteCardStyles(theme), [theme]);
  const [currentQuote, setCurrentQuote] = useState<DafYomiQuote>(() => getRandomQuoteItem());
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteIdRef = useRef(currentQuote.id);
  const skipFocusRefreshRef = useRef(true);
  quoteIdRef.current = currentQuote.id;

  const { animatedCardStyle, animatedQuoteStyle, animatedDiceStyle, animateQuoteChange } = useDailyQuoteAnimation();

  const showAnotherQuote = useCallback(() => {
    setCurrentQuote(pickAnotherQuote(quoteIdRef.current));
  }, []);

  useFocusEffect(useCallback(() => {
    if (skipFocusRefreshRef.current) {
      skipFocusRefreshRef.current = false;
      return;
    }
    showAnotherQuote();
  }, [showAnotherQuote]));

  useEffect(() => {
    const appStateRef = { current: AppState.currentState };
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      if (previousState === 'background' && nextState === 'active') {
        showAnotherQuote();
      }
    });
    return () => {
      subscription.remove();
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, [showAnotherQuote]);

  const handleShuffle = useCallback(() => {
    void triggerImpact('light');
    animateQuoteChange(() => {
      setCurrentQuote((current) => pickAnotherQuote(current.id));
    });
  }, [animateQuoteChange]);

  const handleCopy = useCallback(async () => {
    const formatted = formatQuote(currentQuote);
    await Clipboard.setStringAsync(formatted);
    void triggerSuccess();
    setCopied(true);

    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [currentQuote]);

  const handleShare = useCallback(async () => {
    void triggerImpact('light');
    const formatted = formatQuote(currentQuote);
    try {
      await Share.share({
        message: `${formatted}\n\nנשלח מתוך מסע דף - אפליקציית הדף היומי`,
      });
    } catch {
      return;
    }
  }, [currentQuote]);

  const sourceLabel = useMemo(() => {
    if (!currentQuote.source && !currentQuote.author) return null;
    if (currentQuote.author && currentQuote.source) {
      return `${currentQuote.author} · ${currentQuote.source}`;
    }
    return currentQuote.source || currentQuote.author;
  }, [currentQuote]);

  return (
    <Animated.View style={[styles.card, animatedCardStyle]}>
      <View pointerEvents="none" style={styles.wash} />
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBox}>
            <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
          </View>
          <Text style={styles.title}>פנינה יומית</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={copied ? 'הועתק' : 'העתק פנינה יומית'}
          >
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={copied ? 18 : 16}
              color={copied ? theme.colors.success : theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="שתף פנינה יומית"
          >
            <Ionicons name="share-social-outline" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShuffle}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="החלף פנינה"
          >
            <Animated.View style={animatedDiceStyle}>
              <Ionicons name="dice-outline" size={17} color={theme.colors.accent} />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={animatedQuoteStyle}>
        <View style={styles.quoteBody}>
          <Text style={styles.quoteText}>{currentQuote.text}</Text>
        </View>

        {sourceLabel && (
          <View style={styles.footer}>
            <Text style={styles.sourceText}>{sourceLabel}</Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
});

export default HomeDailyQuoteCard;
