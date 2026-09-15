import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveAssetUrl } from '../config/api';
import { Nav } from '../navigation/types';
import { getNotesSummary, NotesCategorySummary } from '../services/notes.service';
import { MUTED, NAVY } from '../theme/colors';

type Props = {
  token: string;
  nav: Nav;
};

export default function NotesScreen({ token, nav }: Props) {
  const [categories, setCategories] = useState<NotesCategorySummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isRefresh?: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const result = await getNotesSummary(token);
        setCategories(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notes.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Notes</Text>
        <Pressable
          style={styles.bellBtn}
          hitSlop={8}
          onPress={() => nav.push({ name: 'notifications' })}
        >
          <Ionicons name="notifications-outline" size={22} color={NAVY} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
        }
      >
        {loading && !categories && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        )}

        {!!error && !categories && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load()}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        )}

        {categories?.map((item) => (
          <Pressable
            style={styles.card}
            key={item.category}
            onPress={() => nav.push({ name: 'notesSubjectList', category: item.category })}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.cardTitleRow}>
                <View style={styles.categoryIconWrap}>
                  {item.iconImage ? (
                    <Image
                      source={{ uri: resolveAssetUrl(item.iconImage) }}
                      style={styles.categoryIconImg}
                    />
                  ) : (
                    <Ionicons name="document-text-outline" size={16} color={NAVY} />
                  )}
                </View>
                <Text style={styles.cardTitle}>{item.category} Notes</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={NAVY} />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="library-outline" size={14} color={NAVY} />
                <Text style={styles.metaText}>{item.subjectCount} Subjects</Text>
              </View>
            </View>
          </Pressable>
        ))}

        {categories && categories.length === 0 && (
          <Text style={styles.emptyText}>No notes have been added yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F4EF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: NAVY,
  },
  bellBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 14,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FBEAE8',
    alignItems: 'center',
  },
  errorText: {
    color: '#C0392B',
    fontSize: 13,
    textAlign: 'center',
  },
  retryText: {
    marginTop: 8,
    color: NAVY,
    fontWeight: '700',
    fontSize: 12.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDEBE4',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  categoryIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF1F7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  categoryIconImg: {
    width: 30,
    height: 30,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: NAVY,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: MUTED,
  },
  emptyText: {
    textAlign: 'center',
    color: MUTED,
    marginTop: 30,
  },
});
