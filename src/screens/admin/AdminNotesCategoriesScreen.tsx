import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../components/admin/AdminHeader';
import { AdminNav } from '../../navigation/adminTypes';
import { AdminCategory, getCategories } from '../../services/admin/categories.service';
import { listNotesSubjects } from '../../services/admin/notesSubjects.service';
import { MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  nav: AdminNav;
};

export default function AdminNotesCategoriesScreen({ token, nav }: Props) {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, subjects] = await Promise.all([getCategories(token), listNotesSubjects(token)]);
      setCategories(cats);
      const counts: Record<string, number> = {};
      for (const s of subjects) counts[s.category] = (counts[s.category] ?? 0) + 1;
      setSubjectCounts(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader
        title="Manage Notes"
        subtitle="Pick a category to manage its subjects & chapters"
        onBack={() => nav.pop()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && !categories && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        )}

        {!!error && !categories && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={load}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        )}

        {categories?.map((category) => (
          <Pressable
            key={category.id}
            style={styles.card}
            onPress={() => nav.push({ name: 'notesSubjects', category: category.name })}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={category.iconKey as keyof typeof Ionicons.glyphMap} size={20} color={NAVY} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.name}>{category.name}</Text>
              <Text style={styles.meta}>{subjectCounts[category.name] ?? 0} Subjects</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={NAVY} />
          </Pressable>
        ))}

        {categories && categories.length === 0 && (
          <Text style={styles.emptyText}>
            No categories yet. Add one from the Tests tab first.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },
  loadingBox: { paddingVertical: 40, alignItems: 'center' },
  errorBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FBEAE8',
    alignItems: 'center',
  },
  errorText: { color: '#C0392B', fontSize: 13, textAlign: 'center' },
  retryText: { marginTop: 8, color: NAVY, fontWeight: '700', fontSize: 12.5 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDEBE4',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF1F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  name: { fontSize: 14.5, fontWeight: '800', color: NAVY },
  meta: { fontSize: 11.5, color: MUTED, marginTop: 3 },
  emptyText: { textAlign: 'center', color: MUTED, marginTop: 30 },
});
