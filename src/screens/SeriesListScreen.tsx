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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AccessBadge from '../components/AccessBadge';
import { resolveAssetUrl } from '../config/api';
import { Nav } from '../navigation/types';
import { getSeriesByCategory, SeriesListItem } from '../services/tests.service';
import { ERROR, MUTED, NAVY } from '../theme/colors';

const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

type Props = {
  token: string;
  category: string;
  nav: Nav;
};

type FilterKey = 'all' | 'free' | 'paid';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
];

export default function SeriesListScreen({ token, category, nav }: Props) {
  const [series, setSeries] = useState<SeriesListItem[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isRefresh?: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const result = await getSeriesByCategory(token, category);
        setSeries(result.series);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test series.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, category]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // This list only shows titles/prices, not paid content — allow screenshots
    // here, then restore the app-wide block when the screen is left.
    ScreenCapture.allowScreenCaptureAsync();
    return () => {
      ScreenCapture.preventScreenCaptureAsync();
    };
  }, []);

  const filteredSeries = series?.filter((s) => filter === 'all' || s.accessType === filter) ?? [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={nav.pop} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {category} Test Series
        </Text>
        <View style={styles.iconBtn} />
      </View>

      {/* All / Free / Paid Filter */}
      <View style={styles.filterBar}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
        }
      >
        {loading && !series && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        )}

        {!!error && !series && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load()}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        )}

        {filteredSeries.map((item) => (
          <Pressable
            style={styles.card}
            key={item.id}
            onPress={() => nav.push({ name: 'testList', seriesId: item.id })}
          >
            {!!item.bannerImage?.trim() && (
              <Image
                source={{ uri: resolveAssetUrl(item.bannerImage) }}
                style={styles.banner}
                resizeMode="cover"
              />
            )}
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <AccessBadge
                accessType={item.accessType}
                isLocked={item.accessType === 'paid' && !item.isPurchased}
                price={item.price}
              />
            </View>
            {!!item.shortDescription && (
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.shortDescription}
              </Text>
            )}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="reader-outline" size={14} color={NAVY} />
                <Text style={styles.metaText}>{item.testCount} Tests</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="help-circle-outline" size={14} color={NAVY} />
                <Text style={styles.metaText}>{item.totalQuestions} Qs</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={NAVY} />
                <Text style={styles.metaText}>{item.durationMinutes} mins</Text>
              </View>
            </View>

            {(item.lockReason === 'upcoming' || item.lockReason === 'expired') && (
              <View style={styles.dateStatusRow}>
                <Ionicons
                  name={item.lockReason === 'upcoming' ? 'time-outline' : 'close-circle-outline'}
                  size={13}
                  color={item.lockReason === 'upcoming' ? '#B4790C' : MUTED}
                />
                <Text
                  style={[
                    styles.dateStatusText,
                    item.lockReason === 'expired' && styles.dateStatusTextExpired,
                  ]}
                >
                  {item.lockReason === 'upcoming'
                    ? `Opens on ${formatDate(item.startDate)}`
                    : 'Availability window has ended'}
                </Text>
              </View>
            )}

            {item.accessType === 'paid' && item.freeSampleCount > 0 && (
              <View style={styles.freeSampleRow}>
                <Ionicons name="gift-outline" size={13} color="#2E9E5B" />
                <Text style={styles.freeSampleText}>
                  {item.freeSampleCount} {item.freeSampleCount === 1 ? 'Test' : 'Tests'} Free to Try
                </Text>
              </View>
            )}
          </Pressable>
        ))}

        {series && filteredSeries.length === 0 && (
          <Text style={styles.emptyText}>
            {filter === 'all'
              ? 'No test series added yet for this category.'
              : `No ${filter} series found in this category.`}
          </Text>
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
  filterBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEBE4',
  },
  filterChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: NAVY,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 24, gap: 14 },
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
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#EEF1F7',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: NAVY },
  cardDesc: { fontSize: 12, color: MUTED, marginTop: 6, lineHeight: 17 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: MUTED },
  freeSampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EFE9',
  },
  freeSampleText: { fontSize: 12, fontWeight: '700', color: '#2E9E5B' },
  dateStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EFE9',
  },
  dateStatusText: { fontSize: 12, fontWeight: '700', color: '#B4790C' },
  dateStatusTextExpired: { color: MUTED },
  emptyText: { textAlign: 'center', color: MUTED, marginTop: 30 },
});
