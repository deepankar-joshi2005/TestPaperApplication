import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { getNotifications } from '../services/notifications.service';
import { ERROR, NAVY } from '../theme/colors';

type Props = {
  token: string;
  onPress: () => void;
  size?: number;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default function NotificationBell({ token, onPress, size = 22, iconColor = NAVY, style }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchUnread = () => {
      getNotifications(token)
        .then((result) => {
          if (!cancelled) setUnreadCount(result.unreadCount);
        })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  return (
    <Pressable style={[styles.wrap, style]} onPress={onPress} hitSlop={8}>
      <Ionicons name="notifications-outline" size={size} color={iconColor} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -5,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: ERROR,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
