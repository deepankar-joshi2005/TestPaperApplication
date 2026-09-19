import { Ionicons } from '@expo/vector-icons';
import * as ScreenCapture from 'expo-screen-capture';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveAssetUrl } from '../config/api';
import { Nav } from '../navigation/types';
import { startAttempt } from '../services/attempts.service';
import { getTestsBySeries, TestListItem } from '../services/tests.service';
import { ERROR, GOLD, MUTED, NAVY } from '../theme/colors';

const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

type Props = {
  token: string;
  seriesId: string;
  nav: Nav;
};

type Filter = 'All' | 'New' | 'Attempted' | 'Completed';
const FILTERS: Filter[] = ['All', 'New', 'Attempted', 'Completed'];

const filterMatches = (filter: Filter, status: TestListItem['status']): boolean => {
  if (filter === 'All') return true;
  if (filter === 'New') return status === 'not-attempted';
  if (filter === 'Attempted') return status === 'in-progress';
  return status === 'completed';
};

export default function TestListScreen({ token, seriesId, nav }: Props) {
  const [seriesTitle, setSeriesTitle] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [accessType, setAccessType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState(0);
  const [lockReason, setLockReason] = useState<TestListItem['lockReason']>(null);
  const [seriesStartDate, setSeriesStartDate] = useState<string | null>(null);
  const [tests, setTests] = useState<TestListItem[] | null>(null);
  const [filter, setFilter] = useState<Filter>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [startingId, setStartingId] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh?: boolean) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError('');
      try {
        const result = await getTestsBySeries(token, seriesId);
        setSeriesTitle(result.seriesTitle);
        setBannerImage(result.bannerImage);
        setAccessType(result.accessType);
        setPrice(result.price);
        setLockReason(result.lockReason);
        setSeriesStartDate(result.startDate);
        setTests(result.tests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tests.');
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [token, seriesId]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // This list only shows test titles/status, no exam content — allow
    // screenshots here, then restore the app-wide block when the screen is left.
    ScreenCapture.allowScreenCaptureAsync();
    return () => {
      ScreenCapture.preventScreenCaptureAsync();
    };
  }, []);

  const goToCheckout = () => {
    nav.push({
      name: 'paymentCheckout',
      itemType: 'series',
      itemId: seriesId,
      itemTitle: seriesTitle,
      price,
    });
  };

  const handleStartOrResume = async (test: TestListItem) => {
    if (test.lockReason === 'upcoming') {
      Alert.alert('Not available yet', `This test will open on ${formatDate(test.startDate)}.`);
      return;
    }
    if (test.lockReason === 'expired') {
      Alert.alert('Window closed', "This test's availability window has ended.");
      return;
    }
    if (test.isLocked) {
      goToCheckout();
      return;
    }
    const routeName = test.format === 'pdf' ? 'pdfTestTaking' : 'testTaking';

    if (test.status === 'in-progress' && test.attemptId) {
      nav.push({ name: routeName, attemptId: test.attemptId, testId: test.id });
      return;
    }
    setStartingId(test.id);
    try {
      const result = await startAttempt(token, test.id);
      nav.push({ name: routeName, attemptId: result.attemptId, testId: test.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start test.');
    } finally {
      setStartingId(null);
    }
  };

  const handleViewResult = (test: TestListItem) => {
    if (test.attemptId) nav.push({ name: 'testResult', attemptId: test.attemptId });
  };

  const filteredTests = tests?.filter((t) => filterMatches(filter, t.status)) ?? [];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={nav.pop} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {seriesTitle || 'Test Series'}
        </Text>
        <Pressable
          style={styles.iconBtn}
          hitSlop={8}
          onPress={() => nav.push({ name: 'notifications' })}
        >
          <Ionicons name="notifications-outline" size={20} color={NAVY} />
        </Pressable>
      </View>

      {!!bannerImage?.trim() && (
        <Image
          source={{ uri: resolveAssetUrl(bannerImage) }}
          style={styles.banner}
          resizeMode="cover"
        />
      )}

      {lockReason === 'payment' && (
        <View style={styles.paywallCard}>
          <View style={styles.paywallIconWrap}>
            <Ionicons name="lock-closed" size={18} color="#8A5A00" />
          </View>
          <View style={styles.paywallTextWrap}>
            <Text style={styles.paywallTitle}>This series is locked</Text>
            <Text style={styles.paywallDesc}>
              Unlock all mock tests in this series for a one-time payment.
            </Text>
          </View>
          <Pressable style={styles.paywallBtn} onPress={goToCheckout}>
            <Text style={styles.paywallBtnText}>Unlock ₹{price}</Text>
          </Pressable>
        </View>
      )}

      {lockReason === 'upcoming' && (
        <View style={[styles.paywallCard, styles.scheduleCard]}>
          <View style={styles.paywallIconWrap}>
            <Ionicons name="time-outline" size={18} color="#B4790C" />
          </View>
          <View style={styles.paywallTextWrap}>
            <Text style={styles.paywallTitle}>Not open yet</Text>
            <Text style={styles.paywallDesc}>
              This series will open on {formatDate(seriesStartDate)}.
            </Text>
          </View>
        </View>
      )}

      {lockReason === 'expired' && (
        <View style={[styles.paywallCard, styles.scheduleCard]}>
          <View style={styles.paywallIconWrap}>
            <Ionicons name="close-circle-outline" size={18} color={MUTED} />
          </View>
          <View style={styles.paywallTextWrap}>
            <Text style={styles.paywallTitle}>Availability window ended</Text>
            <Text style={styles.paywallDesc}>This series is no longer open for attempts.</Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={NAVY} />
        }
      >
        {loading && !tests && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {filteredTests.map((test) => (
          <View style={styles.card} key={test.id}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>{test.title}</Text>
              {test.lockReason ? (
                <LockBadge reason={test.lockReason} startDate={test.startDate} />
              ) : (
                <StatusBadge status={test.status} isFreeSample={test.isFreeSample} />
              )}
            </View>
            <Text style={styles.metaText}>
              {test.totalQuestions} Questions • {test.durationMinutes} Minutes •{' '}
              {test.totalMarks} Marks
            </Text>
            <View style={styles.divider} />
            <View style={styles.cardBottomRow}>
              <Text style={styles.difficultyText}>
                Difficulty: <Text style={styles.difficultyValue}>{test.difficulty}</Text>
              </Text>
              {test.isLocked ? (
                <Pressable style={styles.primaryBtn} onPress={() => handleStartOrResume(test)}>
                  <Text style={styles.primaryBtnText}>
                    {test.lockReason === 'payment' ? 'Unlock' : 'View Details'}
                  </Text>
                </Pressable>
              ) : test.status === 'completed' ? (
                <View style={styles.completedActions}>
                  <Text style={styles.scoreText}>
                    Score: {test.score}/{test.totalMarks}
                  </Text>
                  <View style={styles.completedBtnRow}>
                    <Pressable style={styles.outlineBtn} onPress={() => handleViewResult(test)}>
                      <Text style={styles.outlineBtnText}>View Result</Text>
                    </Pressable>
                    {test.canReattempt && (
                      <Pressable
                        style={styles.primaryBtnSmall}
                        onPress={() => handleStartOrResume(test)}
                        disabled={startingId === test.id}
                      >
                        {startingId === test.id ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.primaryBtnSmallText}>Reattempt</Text>
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>
              ) : (
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => handleStartOrResume(test)}
                  disabled={startingId === test.id}
                >
                  {startingId === test.id ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {test.status === 'in-progress' ? 'Resume Test' : 'Start Test'}
                    </Text>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        ))}

        {tests && filteredTests.length === 0 && (
          <Text style={styles.emptyText}>No tests found for this filter.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LockBadge({
  reason,
  startDate,
}: {
  reason: 'payment' | 'upcoming' | 'expired';
  startDate: string | null;
}) {
  if (reason === 'upcoming') {
    return (
      <View style={[styles.badge, styles.badgeUpcoming]}>
        <Ionicons name="time-outline" size={10} color="#B4790C" />
        <Text style={[styles.badgeText, styles.badgeTextUpcoming]}>
          {startDate ? `From ${formatDate(startDate)}` : 'Upcoming'}
        </Text>
      </View>
    );
  }
  if (reason === 'expired') {
    return (
      <View style={[styles.badge, styles.badgeExpired]}>
        <Ionicons name="close-circle-outline" size={10} color={MUTED} />
        <Text style={[styles.badgeText, styles.badgeTextExpired]}>Expired</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeLocked]}>
      <Ionicons name="lock-closed" size={10} color="#8A5A00" />
      <Text style={[styles.badgeText, styles.badgeTextLocked]}>Locked</Text>
    </View>
  );
}

function StatusBadge({
  status,
  isFreeSample,
}: {
  status: TestListItem['status'];
  isFreeSample: boolean;
}) {
  if (status === 'completed') {
    return (
      <View style={[styles.badge, styles.badgeCompleted]}>
        <Text style={[styles.badgeText, styles.badgeTextCompleted]}>Attempted</Text>
      </View>
    );
  }
  if (status === 'in-progress') {
    return (
      <View style={[styles.badge, styles.badgeProgress]}>
        <Text style={[styles.badgeText, styles.badgeTextProgress]}>In Progress</Text>
      </View>
    );
  }
  if (isFreeSample) {
    return (
      <View style={[styles.badge, styles.badgeFree]}>
        <Text style={[styles.badgeText, styles.badgeTextFree]}>Free Sample</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeNew]}>
      <Text style={[styles.badgeText, styles.badgeTextNew]}>Not Attempted</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F4EF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: NAVY,
  },
  banner: {
    width: '100%',
    height: 130,
    marginBottom: 12,
    backgroundColor: '#EEF1F7',
  },
  paywallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 18,
    marginBottom: 12,
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
  scheduleCard: { backgroundColor: '#EEF1F7', borderColor: '#D9E0EC' },
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 52,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEBE4',
  },
  filterPillActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: NAVY,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
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
    color: ERROR,
    fontSize: 13,
    textAlign: 'center',
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
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: NAVY,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeNew: { backgroundColor: '#FDF1DC' },
  badgeProgress: { backgroundColor: '#E9F0FB' },
  badgeCompleted: { backgroundColor: '#E4F5EA' },
  badgeFree: { backgroundColor: '#E4F5EA' },
  badgeLocked: { backgroundColor: '#FDF1DC' },
  badgeUpcoming: { backgroundColor: '#FDF1DC' },
  badgeExpired: { backgroundColor: '#EEEDE6' },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  badgeTextNew: { color: '#B4790C' },
  badgeTextProgress: { color: NAVY },
  badgeTextCompleted: { color: '#2E9E5B' },
  badgeTextFree: { color: '#2E9E5B' },
  badgeTextLocked: { color: '#8A5A00' },
  badgeTextUpcoming: { color: '#B4790C' },
  badgeTextExpired: { color: MUTED },
  metaText: {
    fontSize: 12,
    color: MUTED,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDEBE4',
    marginTop: 12,
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 12.5,
    color: MUTED,
  },
  difficultyValue: {
    fontWeight: '700',
    color: NAVY,
  },
  primaryBtn: {
    backgroundColor: NAVY,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    minWidth: 96,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  completedActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: NAVY,
  },
  completedBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  outlineBtn: {
    borderWidth: 1.3,
    borderColor: NAVY,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  outlineBtnText: {
    color: NAVY,
    fontWeight: '700',
    fontSize: 12,
  },
  primaryBtnSmall: {
    backgroundColor: GOLD,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 84,
    alignItems: 'center',
  },
  primaryBtnSmallText: {
    color: NAVY,
    fontWeight: '700',
    fontSize: 12,
  },
  emptyText: { textAlign: 'center', color: MUTED, marginTop: 30 },
});
