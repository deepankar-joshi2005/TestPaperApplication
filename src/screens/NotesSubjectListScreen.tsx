import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Nav } from '../navigation/types';
import { getSubjectsByCategory, NotesSubjectItem } from '../services/notes.service';
import { ERROR, MUTED, NAVY } from '../theme/colors';

type Props = {
  token: string;
  category: string;
  nav: Nav;
};

export default function NotesSubjectListScreen({ token, category, nav }: Props) {
  const [subjects, setSubjects] = useState<NotesSubjectItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isRefresh?: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const result = await getSubjectsByCategory(token, category);
        setSubjects(result.subjects);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subjects.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, category]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={nav.pop} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {category} Notes
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
        }
      >
        {loading && !subjects && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        )}

        {!!error && !subjects && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load()}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        )}

        {subjects?.map((subject) => (
          <Pressable
            key={subject.id}
            style={styles.card}
            onPress={() =>
              nav.push({ name: 'noteList', subjectId: subject.id, subjectName: subject.name })
            }
          >
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>{subject.name}</Text>
              <Ionicons name="chevron-forward" size={18} color={NAVY} />
            </View>
            {!!subject.description && <Text style={styles.cardDesc}>{subject.description}</Text>}
            <Text style={styles.metaText}>{subject.noteCount} Chapters</Text>
          </Pressable>
        ))}

        {subjects && subjects.length === 0 && (
          <Text style={styles.emptyText}>No subjects added yet for this category.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: NAVY },
  scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24, gap: 12 },
  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  errorBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FBEAE8',
    alignItems: 'center',
  },
  errorText: { color: ERROR, fontSize: 13, textAlign: 'center' },
  retryText: { marginTop: 8, color: NAVY, fontWeight: '700', fontSize: 12.5 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDEBE4',
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: NAVY, flexShrink: 1 },
  cardDesc: { fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 17 },
  metaText: { fontSize: 12, color: MUTED, marginTop: 10 },
  emptyText: { textAlign: 'center', color: MUTED, marginTop: 30 },
});
