import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import { AdminNav } from '../../navigation/adminTypes';
import { AdminSeriesDetail, getSeriesDetail } from '../../services/admin/series.service';
import { MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  seriesId: string;
  nav: AdminNav;
};

export default function AdminSeriesPublishSuccessScreen({ token, seriesId, nav }: Props) {
  const [series, setSeries] = useState<AdminSeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await getSeriesDetail(token, seriesId);
      setSeries(detail);
    } finally {
      setLoading(false);
    }
  }, [token, seriesId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading || !series ? (
          <ActivityIndicator color={NAVY} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            <View style={styles.iconWrap}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Test Series Published!</Text>
            <Text style={styles.subtitle}>
              {series.title} is now live and visible to students in the app.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryHeading}>PUBLISHED SUMMARY</Text>
              <SummaryRow label="Category" value={series.category} />
              <SummaryRow label="Series" value={series.title} />
              <SummaryRow
                label="Access"
                value={series.accessType === 'free' ? 'Free' : `Paid · ₹${series.price}`}
              />
              <SummaryRow label="Tests Added So Far" value={`${series.testCount}`} />
            </View>

            <View style={styles.addTestCard}>
              <Ionicons name="add-circle" size={22} color="#2E9E5B" />
              <View style={{ flex: 1 }}>
                <Text style={styles.addTestTitle}>No mock tests inside yet?</Text>
                <Text style={styles.addTestDesc}>
                  Add a test to this series now so students have something to attempt.
                </Text>
              </View>
            </View>

            <PrimaryButton
              label="ADD A TEST NOW"
              onPress={() => nav.replace({ name: 'createTestStep1', seriesId })}
            />
            <Pressable
              style={styles.linkBtn}
              onPress={() => nav.resetToTab('tests')}
            >
              <Text style={styles.linkBtnText}>View in Student App</Text>
            </Pressable>
            <Pressable style={styles.backBtn} onPress={() => nav.resetToTab('home')}>
              <Text style={styles.backBtnText}>Back to Dashboard</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  scrollContent: { padding: 24, paddingTop: 50, alignItems: 'center' },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2E9E5B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 21, fontWeight: '800', color: NAVY, textAlign: 'center' },
  subtitle: { fontSize: 13, color: MUTED, textAlign: 'center', marginTop: 10, paddingHorizontal: 12 },
  summaryCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EDEBE4',
    marginTop: 26,
    marginBottom: 16,
  },
  summaryHeading: { fontSize: 11, fontWeight: '800', color: MUTED, letterSpacing: 0.5, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 13, color: MUTED },
  summaryValue: { fontSize: 13.5, fontWeight: '800', color: NAVY },
  addTestCard: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#E4F5EA',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFE6CE',
    marginBottom: 22,
  },
  addTestTitle: { fontSize: 13.5, fontWeight: '800', color: NAVY },
  addTestDesc: { fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 17 },
  linkBtn: { paddingVertical: 14, width: '100%', alignItems: 'center' },
  linkBtnText: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  backBtn: { paddingVertical: 6, width: '100%', alignItems: 'center' },
  backBtnText: { fontSize: 13.5, fontWeight: '700', color: MUTED },
});
