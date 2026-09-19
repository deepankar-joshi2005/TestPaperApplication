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
import AdminHeader from '../../components/admin/AdminHeader';
import FilterPillTabs from '../../components/admin/FilterPillTabs';
import StatTile from '../../components/admin/StatTile';
import { AdminNav } from '../../navigation/adminTypes';
import {
  AdminPaymentItem,
  AdminPaymentsSummary,
  getPaymentsSummary,
  listPayments,
} from '../../services/admin/payments.service';
import { MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  nav: AdminNav;
};

type FilterKey = 'all' | 'series' | 'notesSubject';

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminPaymentsScreen({ token, nav }: Props) {
  const [summary, setSummary] = useState<AdminPaymentsSummary | null>(null);
  const [payments, setPayments] = useState<AdminPaymentItem[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (isRefresh?: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const [summaryResult, paymentsResult] = await Promise.all([
          getPaymentsSummary(token),
          listPayments(token, filter === 'all' ? undefined : { itemType: filter }),
        ]);
        setSummary(summaryResult);
        setPayments(paymentsResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payments.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, filter]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader title="Payments & Revenue" onBack={() => nav.pop()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
        }
      >
        {loading && !summary && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        )}

        {!!error && !summary && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => load()}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </Pressable>
          </View>
        )}

        {summary && (
          <>
            <View style={styles.statsGrid}>
              <StatTile label="Total Revenue" value={`₹${summary.totalRevenue}`} width="third" />
              <StatTile label="This Month" value={`₹${summary.thisMonthRevenue}`} width="third" />
              <StatTile label="Today" value={`₹${summary.todaysRevenue}`} width="third" />
              <StatTile label="Paying Students" value={summary.totalPayingStudents} width="third" />
              <StatTile label="Total Purchases" value={summary.totalPurchases} width="third" />
            </View>

            {(summary.topSeries.length > 0 || summary.topNotesSubjects.length > 0) && (
              <>
                <Text style={styles.sectionTitle}>Top Earners</Text>
                {summary.topSeries.map((s) => (
                  <View key={`series-${s.id}`} style={styles.topRow}>
                    <Text style={styles.topLabel} numberOfLines={1}>
                      {s.title} <Text style={styles.topTag}>Series</Text>
                    </Text>
                    <Text style={styles.topValue}>
                      ₹{s.revenue} • {s.buyerCount} buyers
                    </Text>
                  </View>
                ))}
                {summary.topNotesSubjects.map((s) => (
                  <View key={`notes-${s.id}`} style={styles.topRow}>
                    <Text style={styles.topLabel} numberOfLines={1}>
                      {s.title} <Text style={styles.topTag}>Notes</Text>
                    </Text>
                    <Text style={styles.topValue}>
                      ₹{s.revenue} • {s.buyerCount} buyers
                    </Text>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>All Purchases</Text>
          </>
        )}

        {summary && (
          <View style={styles.filterWrap}>
            <FilterPillTabs
              active={filter}
              onChange={(key) => setFilter(key as FilterKey)}
              options={[
                { key: 'all', label: 'All' },
                { key: 'series', label: 'Test Series' },
                { key: 'notesSubject', label: 'Notes' },
              ]}
            />
          </View>
        )}

        {payments?.map((p) => (
          <View key={p.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {p.itemTitle}
              </Text>
              <Text style={styles.cardAmount}>₹{p.amount}</Text>
            </View>
            <Text style={styles.cardMeta}>
              {p.studentName} • {p.studentEmail}
            </Text>
            <Text style={styles.cardDate}>{formatDate(p.purchasedAt)}</Text>
          </View>
        ))}

        {payments && payments.length === 0 && (
          <Text style={styles.emptyText}>No purchases found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  scrollContent: { padding: 18, paddingBottom: 40, gap: 4 },
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: NAVY, marginTop: 20, marginBottom: 10 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EDEBE4',
    marginBottom: 8,
  },
  topLabel: { fontSize: 13, fontWeight: '700', color: NAVY, flexShrink: 1, marginRight: 8 },
  topTag: { fontSize: 10.5, fontWeight: '700', color: MUTED },
  topValue: { fontSize: 12, fontWeight: '700', color: '#2E9E5B' },
  filterWrap: { marginHorizontal: -18, marginBottom: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDEBE4',
    marginBottom: 10,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: NAVY },
  cardAmount: { fontSize: 14, fontWeight: '800', color: '#2E9E5B' },
  cardMeta: { fontSize: 11.5, color: MUTED, marginTop: 5 },
  cardDate: { fontSize: 11, color: MUTED, marginTop: 3 },
  emptyText: { textAlign: 'center', color: MUTED, marginTop: 30 },
});
