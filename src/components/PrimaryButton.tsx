import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GOLD, NAVY } from '../theme/colors';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function PrimaryButton({ label, onPress, loading, disabled }: Props) {
  return (
    <Pressable
      style={[styles.btn, (disabled || loading) && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {/* Gold top border accent like landing page button */}
      <View style={styles.goldAccent} />
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: NAVY,
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: GOLD,
  },
  goldAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: GOLD,
    opacity: 0.6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 1.4,
  },
});
