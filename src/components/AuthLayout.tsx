import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
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
import { CREAM, GOLD, MUTED, NAVY } from '../theme/colors';

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
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {onBack && (
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={onBack} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={NAVY} />
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.form}>{children}</View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{footerText} </Text>
          <Pressable onPress={onFooterAction} hitSlop={8}>
            <Text style={styles.footerAction}>{footerActionText}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  logo: {
    width: 88,
    height: 96,
    alignSelf: 'center',
  },
  title: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  form: {
    marginTop: 28,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
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
});
