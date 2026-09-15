import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../components/admin/AdminHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { AdminNav } from '../../navigation/adminTypes';
import {
  AdminNotesSubjectNoteItem,
  getNotesSubjectNotes,
} from '../../services/admin/notesSubjects.service';
import { deleteNote } from '../../services/admin/notes.service';
import { ERROR, MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  subjectId: string;
  subjectName: string;
  nav: AdminNav;
};

export default function AdminNotesListScreen({ token, subjectId, subjectName, nav }: Props) {
  const [notes, setNotes] = useState<AdminNotesSubjectNoteItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getNotesSubjectNotes(token, subjectId);
      setNotes(result.notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapters.');
    } finally {
      setLoading(false);
    }
  }, [token, subjectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (item: AdminNotesSubjectNoteItem) => {
    Alert.alert('Delete Chapter', `Delete "${item.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNote(token, item.id);
            load();
          } catch (err) {
            Alert.alert('Failed to delete', err instanceof Error ? err.message : '');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader title={subjectName} subtitle="Manage all chapters in this subject" onBack={() => nav.pop()} />

      {loading && !notes && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={NAVY} size="large" />
        </View>
      )}

      {!!error && !notes && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={load}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </Pressable>
        </View>
      )}

      {notes && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Chapters</Text>
              <Text style={styles.statValue}>{notes.length}</Text>
            </View>
          </View>

          <PrimaryButton label="+ Add Chapter" onPress={() => nav.push({ name: 'addNote', subjectId })} />

          {notes.length === 0 && (
            <Text style={styles.emptyText}>No chapters added yet. Tap "Add Chapter" to create one.</Text>
          )}

          {notes.map((note) => (
            <View key={note.id} style={styles.card}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{note.title}</Text>
                <View style={styles.pdfBadge}>
                  <Text style={styles.pdfBadgeText}>{note.pdfUrl ? 'PDF' : 'NO PDF'}</Text>
                </View>
              </View>
              {!!note.description && <Text style={styles.meta}>{note.description}</Text>}
              <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, note.isActive ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, note.isActive && styles.statusTextActive]}>
                    {note.isActive ? 'Visible' : 'Hidden'}
                  </Text>
                </View>
                <View style={styles.linkRow}>
                  <Pressable onPress={() => nav.push({ name: 'addNote', subjectId, noteId: note.id })}>
                    <Text style={styles.linkText}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(note)}>
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
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEBE4',
  },
  statLabel: { fontSize: 11.5, color: MUTED },
  statValue: { fontSize: 18, fontWeight: '800', color: NAVY, marginTop: 4 },
  emptyText: { fontSize: 12.5, color: MUTED, textAlign: 'center', marginTop: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDEBE4',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' },
  title: { fontSize: 14, fontWeight: '800', color: NAVY, flexShrink: 1 },
  pdfBadge: { backgroundColor: '#EEF1F7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  pdfBadgeText: { fontSize: 9.5, fontWeight: '800', color: NAVY },
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
  linkRow: { flexDirection: 'row', gap: 16 },
  linkText: { fontSize: 12.5, fontWeight: '700', color: NAVY },
});
