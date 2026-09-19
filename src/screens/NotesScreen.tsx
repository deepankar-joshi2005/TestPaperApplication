import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NotificationBell from '../components/NotificationBell';
import { resolveAssetUrl } from '../config/api';
import { Nav } from '../navigation/types';
import { getNotesSummary, NotesCategorySummary } from '../services/notes.service';
import { GOLD, MUTED, NAVY } from '../theme/colors';

type Props = {
  token: string;
  nav: Nav;
};

export default function NotesScreen({ token, nav }: Props) {
  const [categories, setCategories] = useState<NotesCategorySummary[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    // This list only shows category-level notes cards, not paid content —
    // allow screenshots here, then restore the app-wide block when left.
    ScreenCapture.allowScreenCaptureAsync();
    return () => {
      ScreenCapture.preventScreenCaptureAsync();
    };
  }, []);

  const filteredCategories = categories?.filter((item) =>
    item.category.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerBadge}>STUDY MATERIAL</Text>
            <Text style={styles.headerTitle}>Notes</Text>
          </View>
          <NotificationBell
            token={token}
            iconColor="#FFFFFF"
            style={styles.headerIconCircle}
            onPress={() => nav.push({ name: 'notifications' })}
          />
        </View>
        <Text style={styles.headerSubtitle}>
          Chapter-wise notes for quick revision across every exam category
        </Text>
        <View style={styles.goldLine} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={17} color={MUTED} />
          <TextInput
            placeholder="Search notes by exam category..."
            placeholderTextColor={MUTED}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {!!searchQuery && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color={MUTED} />
            </Pressable>
          )}
        </View>
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

        {filteredCategories?.map((item) => (
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

        {categories && filteredCategories?.length === 0 && (
          <Text style={styles.emptyText}>No notes match "{searchQuery}".</Text>
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
  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
    lineHeight: 16,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  goldLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: GOLD,
  },
  searchWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE4',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F4EF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: NAVY,
    padding: 0,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
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
