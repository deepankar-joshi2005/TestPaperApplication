import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GOLD, MUTED, NAVY } from '../theme/colors';

export type TabKey = 'home' | 'tests' | 'notes' | 'results' | 'profile';

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'tests', label: 'Tests', icon: 'book-outline' },
  { key: 'notes', label: 'Notes', icon: 'document-text-outline' },
  { key: 'results', label: 'Results', icon: 'trophy-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

export default function BottomTabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();

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
