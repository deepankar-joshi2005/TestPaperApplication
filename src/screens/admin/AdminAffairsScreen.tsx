import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminNav } from '../../navigation/adminTypes';
import {
  CurrentAffairItem,
  CurrentAffairPeriod,
  CurrentAffairType,
  deleteCurrentAffair,
  getCurrentAffairs,
} from '../../services/admin/currentAffairs.service';
import { ERROR, GOLD, MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  nav: AdminNav;
};

const TYPE_FILTERS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All Affairs', icon: 'layers-outline' },
  { key: 'national', label: 'National', icon: 'flag-outline' },
  { key: 'uttarakhand', label: 'Uttarakhand', icon: 'trail-sign-outline' },
  { key: 'international', label: 'International', icon: 'globe-outline' },
];

const PERIOD_FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All Periods' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'half_yearly', label: '6 Months' },
  { key: 'yearly', label: 'Yearly' },
];

const PERIOD_LABELS: Record<CurrentAffairPeriod, string> = {
  weekly: 'Weekly Digest',
  monthly: 'Monthly Digest',
  half_yearly: '6 Months Digest',
  yearly: 'Yearly Compendium',
};

const TYPE_COLORS: Record<CurrentAffairType, { bg: string; text: string }> = {
  national: { bg: '#EBF3FE', text: '#1967D2' },
  uttarakhand: { bg: '#E6F4EA', text: '#137333' },
  international: { bg: '#FEF7E0', text: '#B06000' },
};

export default function AdminAffairsScreen({ token, nav }: Props) {
  const [items, setItems] = useState<CurrentAffairItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      try {
        const data = await getCurrentAffairs(token, {
          type: selectedType,
          period: selectedPeriod,
        });
        setItems(data);
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load affairs');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, selectedType, selectedPeriod]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (item: CurrentAffairItem) => {
    Alert.alert(
      'Delete Current Affairs',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item._id);
            try {
              await deleteCurrentAffair(token, item._id);
              setItems((prev) => prev.filter((i) => i._id !== item._id));
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Could not delete item');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Current Affairs</Text>
          <Text style={styles.headerSub}>Manage Weekly, Monthly & Yearly digests</Text>
        </View>
        <Pressable
          style={styles.addBtn}
          onPress={() =>
            nav.push({
              name: 'adminAddAffair',
            })
          }
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Upload PDF</Text>
        </Pressable>
      </View>

      {/* Type Tabs */}
      <View style={styles.typeTabsRow}>
        {TYPE_FILTERS.map((t) => {
          const active = selectedType === t.key;
          return (
            <Pressable
              key={t.key}
              style={[styles.typeTab, active && styles.typeTabActive]}
              onPress={() => setSelectedType(t.key)}
            >
              <Ionicons
                name={t.icon}
                size={14}
                color={active ? NAVY : MUTED}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.typeTabText, active && styles.typeTabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Period Filter Chips */}
      <View style={styles.periodsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={PERIOD_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.periodsList}
          renderItem={({ item }) => {
            const active = selectedPeriod === item.key;
            return (
              <Pressable
                style={[styles.periodChip, active && styles.periodChipActive]}
                onPress={() => setSelectedPeriod(item.key)}
              >
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
          <ActivityIndicator color={NAVY} size="large" />
          <Text style={styles.loadingText}>Loading Current Affairs...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={GOLD} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="newspaper-outline" size={42} color={MUTED} />
              </View>
              <Text style={styles.emptyTitle}>No Current Affairs Found</Text>
              <Text style={styles.emptySub}>
                Upload weekly, monthly or yearly PDFs for National or Uttarakhand current affairs.
              </Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => nav.push({ name: 'adminAddAffair' })}
              >
                <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                <Text style={styles.emptyBtnText}>Upload First PDF</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => {
            const typeStyle = TYPE_COLORS[item.type] || TYPE_COLORS.national;
            const periodLabel = PERIOD_LABELS[item.period] || item.period;
            const isDeleting = deletingId === item._id;

            return (
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
                      <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>
                        {item.type.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.periodBadge}>
                      <Ionicons name="time-outline" size={12} color={NAVY} />
                      <Text style={styles.periodBadgeText}>{periodLabel}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.deleteIconBtn}
                    onPress={() => handleDelete(item)}
                    disabled={isDeleting}
                    hitSlop={8}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color={ERROR} />
                    ) : (
                      <Ionicons name="trash-outline" size={18} color={ERROR} />
                    )}
                  </Pressable>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                {!!item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <View style={styles.dateWrap}>
                    <Ionicons name="calendar-outline" size={13} color={MUTED} />
                    <Text style={styles.dateText}>Uploaded: {formatDate(item.createdAt)}</Text>
                  </View>

                  <Pressable
                    style={styles.viewPdfBtn}
                    onPress={() =>
                      nav.push({
                        name: 'adminAffairPdfView',
                        title: item.title,
                        pdfUrl: item.pdfUrl,
                      })
                    }
                  >
                    <Ionicons name="document-text" size={14} color="#FFFFFF" />
                    <Text style={styles.viewPdfBtnText}>View PDF</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE4',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: NAVY },
  headerSub: { fontSize: 11.5, color: MUTED, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: NAVY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
  typeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE4',
    paddingHorizontal: 8,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  typeTabActive: {
    borderBottomColor: GOLD,
  },
  typeTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: MUTED,
  },
  typeTabTextActive: {
    color: NAVY,
    fontWeight: '800',
  },
  periodsWrap: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE4',
  },
  periodsList: {
    paddingHorizontal: 14,
    gap: 8,
  },
  periodChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
  },
  periodChipActive: {
    backgroundColor: NAVY,
  },
  periodChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
  },
  periodChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
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
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EAECEF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  emptySub: { fontSize: 12.5, color: MUTED, textAlign: 'center', lineHeight: 18 },
  emptyBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EDEBE4',
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  periodBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: NAVY,
  },
  deleteIconBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
    lineHeight: 20,
  },
  cardDesc: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F4EF',
    marginTop: 2,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: MUTED,
  },
  viewPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: NAVY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewPdfBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
