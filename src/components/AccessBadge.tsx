import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  accessType: 'free' | 'paid';
  isLocked: boolean;
  price: number;
};

const SUCCESS = '#2E9E5B';

export default function AccessBadge({ accessType, isLocked, price }: Props) {
  if (accessType === 'free') {
    return (
      <View style={[styles.pill, styles.freePill]}>
        <Text style={[styles.text, styles.freeText]}>FREE</Text>
      </View>
    );
  }

  if (!isLocked) {
    return (
      <View style={[styles.pill, styles.ownedPill]}>
        <Ionicons name="checkmark-circle" size={12} color={SUCCESS} />
        <Text style={[styles.text, styles.ownedText]}>Purchased</Text>
      </View>
    );
  }

  return (
    <View style={[styles.pill, styles.lockedPill]}>
      <Ionicons name="lock-closed" size={11} color="#8A5A00" />
      <Text style={[styles.text, styles.lockedText]}>₹{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 10.5, fontWeight: '800' },
  freePill: { backgroundColor: '#E4F5EA' },
  freeText: { color: SUCCESS },
  ownedPill: { backgroundColor: '#E4F5EA' },
  ownedText: { color: SUCCESS },
  lockedPill: { backgroundColor: '#FDF1DC' },
  lockedText: { color: '#8A5A00' },
});
