import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../components/admin/AdminHeader';
import { AdminNav } from '../../navigation/adminTypes';
import {
  AdminNotesSubject,
  deleteNotesSubject,
  listNotesSubjects,
} from '../../services/admin/notesSubjects.service';
import { ERROR, MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  category: string;
  nav: AdminNav;
};

export default function AdminNotesSubjectsScreen({ token, category, nav }: Props) {
  const [subjects, setSubjects] = useState<AdminNotesSubject[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listNotesSubjects(token, { category });
      setSubjects(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }, [token, category]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (item: AdminNotesSubject) => {
    Alert.alert(
      'Delete Subject',
      `Delete "${item.name}"? This will permanently remove it along with all its chapters. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotesSubject(token, item.id);
              load();
            } catch (err) {
              Alert.alert('Failed to delete', err instanceof Error ? err.message : '');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader title={`${category} Subjects`} subtitle="Manage subjects for this category" onBack={() => nav.pop()} />

      {loading && !subjects && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={NAVY} size="large" />
        </View>
      )}

      {!!error && !subjects && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={load}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </Pressable>
        </View>
      )}

      {subjects && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable
            style={styles.fab}
            onPress={() => nav.push({ name: 'addNotesSubject', category })}
          >
            <Text style={styles.fabText}>+ Add Subject</Text>
          </Pressable>

          {subjects.length === 0 && (
            <Text style={styles.emptyText}>No subjects added yet. Tap "Add Subject" to create one.</Text>
          )}

          {subjects.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.title}>{item.name}</Text>
              {!!item.description && <Text style={styles.meta}>{item.description}</Text>}
              <Text style={styles.meta}>{item.noteCount} Chapters</Text>
              <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, item.isActive && styles.statusTextActive]}>
                    {item.isActive ? 'Visible' : 'Hidden'}
                  </Text>
                </View>
                <View style={styles.linkRow}>
                  <Pressable
                    onPress={() =>
                      nav.push({ name: 'notesList', subjectId: item.id, subjectName: item.name })
                    }
                  >
                    <Text style={styles.linkText}>Manage Chapters</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => nav.push({ name: 'addNotesSubject', category, subjectId: item.id })}
                  >
                    <Text style={styles.linkText}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item)}>
                    <Text style={[styles.linkText, { color: ERROR }]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  loadingBox: { paddingVertical: 60, alignItems: 'center' },
  errorBox: { margin: 18, padding: 16, borderRadius: 12, backgroundColor: '#FBEAE8', alignItems: 'center' },
  errorText: { color: '#C0392B', fontSize: 13, textAlign: 'center' },
  retryText: { marginTop: 8, color: NAVY, fontWeight: '700', fontSize: 12.5 },
  scrollContent: { padding: 18, paddingBottom: 40, gap: 12 },
  emptyText: { fontSize: 12.5, color: MUTED, textAlign: 'center', marginTop: 10 },
  fab: {
    alignSelf: 'flex-start',
    backgroundColor: NAVY,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginBottom: 4,
  },
  fabText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDEBE4',
  },
  title: { fontSize: 14, fontWeight: '800', color: NAVY },
  meta: { fontSize: 11.5, color: MUTED, marginTop: 5 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EFE9',
  },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusActive: { backgroundColor: '#E1F5EA' },
  statusInactive: { backgroundColor: '#F1F0EA' },
  statusText: { fontSize: 10, fontWeight: '800', color: MUTED },
  statusTextActive: { color: '#2E9E5B' },
  linkRow: { flexDirection: 'row', gap: 14 },
  linkText: { fontSize: 12, fontWeight: '700', color: NAVY },
});
