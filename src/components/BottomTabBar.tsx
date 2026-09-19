import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { GOLD, MUTED, NAVY } from '../theme/colors';

export type TabKey = 'home' | 'tests' | 'affairs' | 'notes' | 'results' | 'profile';

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export default function BottomTabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', label: t('tab_home', 'Home'), icon: 'home-outline' },
    { key: 'tests', label: t('tab_tests', 'Tests'), icon: 'book-outline' },
    { key: 'affairs', label: t('tab_affairs', 'Affairs'), icon: 'newspaper-outline' },
    { key: 'notes', label: t('tab_notes', 'Notes'), icon: 'document-text-outline' },
    { key: 'results', label: t('tab_results', 'Results'), icon: 'trophy-outline' },
    { key: 'profile', label: t('tab_profile', 'Profile'), icon: 'person-outline' },
  ];

  return (
    <View style={[styles.root, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)}>
            <Ionicons
              name={isActive ? (tab.icon.replace('-outline', '') as typeof tab.icon) : tab.icon}
              size={22}
              color={isActive ? NAVY : MUTED}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            {isActive && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEBE4',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
  },
  labelActive: {
    color: NAVY,
  },
  dot: {
    position: 'absolute',
    top: -10,
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
  },
});
