import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture';
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
import { getNotesBySubject, NoteItem } from '../services/notes.service';
import { ERROR, MUTED, NAVY } from '../theme/colors';

type Props = {
  token: string;
  subjectId: string;
  subjectName: string;
  nav: Nav;
};

export default function NoteListScreen({ token, subjectId, subjectName, nav }: Props) {
  const [notes, setNotes] = useState<NoteItem[] | null>(null);
  const [accessType, setAccessType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isRefresh?: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const result = await getNotesBySubject(token, subjectId);
        setNotes(result.notes);
        setAccessType(result.subject.accessType);
        setPrice(result.subject.price);
        setIsLocked(result.subject.isLocked);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chapters.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, subjectId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // This list only shows chapter titles, not the PDF content itself — allow
    // screenshots here, then restore the app-wide block when the screen is left.
    ScreenCapture.allowScreenCaptureAsync();
    return () => {
      ScreenCapture.preventScreenCaptureAsync();
    };
  }, []);

  const goToCheckout = () => {
    nav.push({
      name: 'paymentCheckout',
      itemType: 'notesSubject',
      itemId: subjectId,
      itemTitle: subjectName,
      price,
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={nav.pop} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {subjectName}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      {accessType === 'paid' && isLocked && (
        <View style={styles.paywallCard}>
          <View style={styles.paywallIconWrap}>
            <Ionicons name="lock-closed" size={18} color="#8A5A00" />
          </View>
          <View style={styles.paywallTextWrap}>
            <Text style={styles.paywallTitle}>This subject is locked</Text>
            <Text style={styles.paywallDesc}>
              Unlock all chapter notes for this subject with a one-time payment.
            </Text>
          </View>
          <Pressable style={styles.paywallBtn} onPress={goToCheckout}>
            <Text style={styles.paywallBtnText}>Unlock ₹{price}</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
        }
      >
        {loading && !notes && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        )}

        {!!error && !notes && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load()}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        )}

        {notes?.map((note) => (
          <View key={note.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>{note.title}</Text>
              {note.isFreePreview && (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              )}
            </View>
            {!!note.description && <Text style={styles.cardDesc}>{note.description}</Text>}
            {note.isLocked ? (
              <Pressable style={styles.lockedBtn} onPress={goToCheckout}>
                <Ionicons name="lock-closed" size={16} color="#8A5A00" />
                <Text style={styles.lockedBtnText}>Unlock Chapter Notes — ₹{price}</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.viewBtn}
                onPress={() =>
                  note.pdfUrl &&
                  nav.push({ name: 'notePdfView', title: note.title, pdfUrl: note.pdfUrl })
                }
                disabled={!note.pdfUrl}
              >
                <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
                <Text style={styles.viewBtnText}>View PDF</Text>
              </Pressable>
            )}
          </View>
        ))}

        {notes && notes.length === 0 && (
          <Text style={styles.emptyText}>No chapters added yet for this subject.</Text>
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
  paywallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 18,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FDF1DC',
    borderWidth: 1,
    borderColor: '#F0DDB0',
  },
  paywallIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paywallTextWrap: { flex: 1 },
  paywallTitle: { fontSize: 13.5, fontWeight: '800', color: NAVY },
  paywallDesc: { fontSize: 11.5, color: MUTED, marginTop: 3, lineHeight: 16 },
  paywallBtn: {
    backgroundColor: NAVY,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  paywallBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12.5 },
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
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: NAVY },
  freeBadge: {
    backgroundColor: '#E4F5EA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  freeBadgeText: { fontSize: 10.5, fontWeight: '800', color: '#2E9E5B' },
  cardDesc: { fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 17 },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NAVY,
    borderRadius: 20,
    paddingVertical: 10,
    marginTop: 14,
  },
  viewBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  lockedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FDF1DC',
    borderRadius: 20,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#F0DDB0',
  },
  lockedBtnText: { color: '#8A5A00', fontWeight: '700', fontSize: 13 },
  emptyText: { textAlign: 'center', color: MUTED, marginTop: 30 },
});
