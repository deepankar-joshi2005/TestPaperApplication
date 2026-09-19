import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture';
import { ReactNode, useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GOLD, MUTED, NAVY } from '../theme/colors';

type Props = {
  onBack?: () => void;
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerActionText: string;
  onFooterAction: () => void;
};

export default function AuthLayout({
  onBack,
  title,
  subtitle,
  children,
  footerText,
  footerActionText,
  onFooterAction,
}: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Login/Sign Up screens have nothing sensitive to protect — allow
    // screenshots here, then restore the app-wide block when the screen is left.
    ScreenCapture.allowScreenCaptureAsync();
    return () => {
      ScreenCapture.preventScreenCaptureAsync();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Simple header — just the logo (and back button when needed) on the plain blue page background */}
      {onBack && (
        <Pressable
          style={[styles.backBtn, { top: insets.top + 10 }]}
          onPress={onBack}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={20} color={NAVY} />
        </Pressable>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.form}>{children}</View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{footerText} </Text>
            <Pressable onPress={onFooterAction} hitSlop={8}>
              <Text style={styles.footerAction}>{footerActionText}</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom tagline */}
        <Text style={styles.tagline}>One Step Ahead In The Quest Of Dreams.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF2F8',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(22,49,92,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 116,
    height: 126,
    alignSelf: 'center',
    marginBottom: 12,
  },
  /* ── Scroll / Card ── */
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: NAVY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(22,49,92,0.07)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 5,
    fontSize: 12.5,
    color: MUTED,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 18,
  },
  form: {
    marginTop: 22,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: MUTED,
  },
  footerAction: {
    fontSize: 13,
    fontWeight: '700',
    color: GOLD,
  },
  tagline: {
    marginTop: 18,
    fontSize: 11,
    color: '#8896A7',
    textAlign: 'center',
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
});
