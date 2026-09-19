import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Nav } from '../navigation/types';
import { CurrentAffairItem } from '../services/admin/currentAffairs.service';
import { fetchStudentCurrentAffairs } from '../services/currentAffairs.service';
import { GOLD, MUTED, NAVY } from '../theme/colors';

type Props = {
  token: string;
  nav: Nav;
};

type ScopeType = 'national' | 'uttarakhand' | 'international' | 'all';
type PeriodType = 'all' | 'weekly' | 'monthly' | 'half_yearly' | 'yearly';

const SCOPES: { key: ScopeType; label: string; icon: string; flag: string }[] = [
  { key: 'national', label: 'National', icon: 'flag', flag: '🇮🇳' },
  { key: 'uttarakhand', label: 'Uttarakhand', icon: 'trail-sign', flag: '🏔️' },
  { key: 'international', label: 'International', icon: 'globe', flag: '🌐' },
];

const PERIOD_CHIPS: { key: PeriodType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'layers-outline' },
  { key: 'weekly', label: 'Weekly', icon: 'calendar-clear-outline' },
  { key: 'monthly', label: 'Monthly', icon: 'calendar-outline' },
  { key: 'half_yearly', label: '6 Months', icon: 'time-outline' },
  { key: 'yearly', label: 'Yearly', icon: 'trophy-outline' },
];

const PERIOD_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  weekly: { label: 'Weekly Digest', bg: '#EFF6FF', text: '#2563EB' },
  monthly: { label: 'Monthly Digest', bg: '#FDF2F8', text: '#DB2777' },
  half_yearly: { label: '6 Months Digest', bg: '#F5F3FF', text: '#7C3AED' },
  yearly: { label: 'Yearly Compendium', bg: '#FEF3C7', text: '#D97706' },
};

const SCOPE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  national: { label: 'National', bg: '#EBF3FE', text: '#1967D2' },
  uttarakhand: { label: 'Uttarakhand', bg: '#E6F4EA', text: '#137333' },
  international: { label: 'International', bg: '#FEF7E0', text: '#B06000' },
};

export default function CurrentAffairsScreen({ token, nav }: Props) {
  const [items, setItems] = useState<CurrentAffairItem[]>([]);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({
    national: 0,
    uttarakhand: 0,
    international: 0,
    total: 0,
  });
  const [selectedScope, setSelectedScope] = useState<ScopeType>('national');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      try {
        const res = await fetchStudentCurrentAffairs(token, {
          type: selectedScope === 'all' ? undefined : selectedScope,
          period: selectedPeriod === 'all' ? undefined : selectedPeriod,
          search: searchQuery.trim() || undefined,
        });
        setItems(res.items);
        if (res.typeCounts) {
          setTypeCounts(res.typeCounts);
        }
      } catch (err) {
        console.error('Failed to load current affairs', err);
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, selectedScope, selectedPeriod, searchQuery]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerBadge}>EXAM PREPARATION</Text>
            <Text style={styles.headerTitle}>Current Affairs</Text>
          </View>
          <View style={styles.headerIconCircle}>
            <Ionicons name="newspaper-outline" size={24} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Weekly, Monthly & Yearly PDF digests with Uttarakhand & National coverage
        </Text>
        <View style={styles.goldLine} />
      </View>

      {/* Scope Segment Tabs */}
      <View style={styles.scopeContainer}>
        {SCOPES.map((s) => {
          const active = selectedScope === s.key;
          const count = typeCounts[s.key] ?? 0;
          return (
            <Pressable
              key={s.key}
              style={[styles.scopeBtn, active && styles.scopeBtnActive]}
              onPress={() => setSelectedScope(s.key)}
            >
              <Text style={styles.scopeFlag}>{s.flag}</Text>
              <Text style={[styles.scopeLabel, active && styles.scopeLabelActive]}>
                {s.label}
              </Text>
              {count > 0 && (
                <View style={[styles.countBadge, active && styles.countBadgeActive]}>
                  <Text style={[styles.countText, active && styles.countTextActive]}>
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={17} color={MUTED} />
          <TextInput
            placeholder={`Search in ${selectedScope} current affairs...`}
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

      {/* Period Filter Chips */}
      <View style={styles.periodBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PERIOD_CHIPS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.periodList}
          renderItem={({ item }) => {
            const active = selectedPeriod === item.key;
            return (
              <Pressable
                style={[styles.periodChip, active && styles.periodChipActive]}
                onPress={() => setSelectedPeriod(item.key)}
              >
                <Ionicons
                  name={item.icon}
                  size={13}
                  color={active ? '#FFFFFF' : NAVY}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Content List */}
      {loading && !refreshing ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={NAVY} />
          <Text style={styles.loadingText}>Fetching Current Affairs...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={GOLD}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyCircle}>
                <Ionicons name="document-text-outline" size={38} color={MUTED} />
              </View>
              <Text style={styles.emptyTitle}>No Current Affairs Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No results matching "${searchQuery}".`
                  : `No ${selectedPeriod !== 'all' ? selectedPeriod : ''} digests uploaded for this section yet.`}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const scopeStyle = SCOPE_BADGES[item.type] || SCOPE_BADGES.national;
            const periodStyle = PERIOD_BADGES[item.period] || {
              label: item.period,
              bg: '#F0F2F5',
              text: NAVY,
            };

            return (
              <View style={styles.card}>
                {/* Badges row */}
                <View style={styles.cardTopRow}>
                  <View style={styles.badgeGroup}>
                    <View style={[styles.badge, { backgroundColor: scopeStyle.bg }]}>
                      <Text style={[styles.badgeText, { color: scopeStyle.text }]}>
                        {scopeStyle.label}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: periodStyle.bg }]}>
                      <Text style={[styles.badgeText, { color: periodStyle.text }]}>
                        {periodStyle.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.pdfBadge}>
                    <Ionicons name="document-text" size={13} color="#C53030" />
                    <Text style={styles.pdfBadgeText}>PDF</Text>
                  </View>
                </View>

                {/* Title */}
                <Text style={styles.cardTitle}>{item.title}</Text>

                {/* Description */}
                {!!item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                {/* Footer with date & Read button */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.dateCol}>
                    <Ionicons name="calendar-outline" size={14} color={MUTED} />
                    <Text style={styles.dateText}>Uploaded on {formatDate(item.createdAt)}</Text>
                  </View>

                  <Pressable
                    style={styles.readBtn}
                    onPress={() =>
                      nav.push({
                        name: 'notePdfView',
                        title: item.title,
                        pdfUrl: item.pdfUrl,
                      })
                    }
                  >
                    <Ionicons name="book-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.readBtnText}>Read PDF</Text>
                    <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: GOLD,
  },
  scopeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE4',
  },
  scopeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#F7F7F5',
    borderWidth: 1.5,
    borderColor: '#EDEBE4',
    gap: 4,
  },
  scopeBtnActive: {
    backgroundColor: '#EEF2F8',
    borderColor: NAVY,
  },
  scopeFlag: {
    fontSize: 14,
  },
  scopeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: MUTED,
  },
  scopeLabelActive: {
    color: NAVY,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  countBadgeActive: {
    backgroundColor: NAVY,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  searchWrap: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
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
  periodBar: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE4',
  },
  periodList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodChipActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  periodChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: NAVY,
  },
  periodChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 14,
    paddingBottom: 35,
    gap: 12,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: MUTED,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#EAECEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NAVY,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EDEBE4',
    gap: 8,
    elevation: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  pdfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  pdfBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C53030',
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: NAVY,
    lineHeight: 21,
  },
  cardDesc: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 17,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F4EF',
    marginTop: 2,
  },
  dateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: MUTED,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: NAVY,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  readBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
