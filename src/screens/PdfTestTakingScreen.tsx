import { Ionicons } from '@expo/vector-icons';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { resolveAssetUrl } from '../config/api';
import { Nav } from '../navigation/types';
import { StartAttemptResponse, startAttempt, submitAttempt } from '../services/attempts.service';
import { ERROR, GOLD, MUTED, NAVY } from '../theme/colors';
import { buildPdfViewerHtml } from '../utils/pdfViewer';

type Props = {
  token: string;
  testId: string;
  nav: Nav;
};

const formatTime = (totalSeconds: number): string => {
  const clamped = Math.max(0, totalSeconds);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function PdfTestTakingScreen({ token, testId, nav }: Props) {
  // Blocks screenshots & screen recording while this screen is open.
  usePreventScreenCapture();
  const [session, setSession] = useState<StartAttemptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [webViewError, setWebViewError] = useState('');
  const submittedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await startAttempt(token, testId);
        setSession(result);
        const elapsed = (Date.now() - new Date(result.startedAt).getTime()) / 1000;
        setRemainingSeconds(Math.max(0, result.test.durationMinutes * 60 - elapsed));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, testId]);

  const handleSubmit = useCallback(async () => {
    if (!session || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await submitAttempt(token, session.attemptId);
      nav.replace({ name: 'testResult', attemptId: session.attemptId });
    } catch (err) {
      submittedRef.current = false;
      setError(err instanceof Error ? err.message : 'Failed to submit test.');
      setSubmitting(false);
    }
  }, [session, token, nav]);

  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, handleSubmit]);

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.centerBox}>
          <ActivityIndicator color={GOLD} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error || 'Unable to load this test.'}</Text>
          <Pressable onPress={nav.pop}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const pdfUrl = resolveAssetUrl(session.test.questionPdfUrl);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Structured Header Bar — back button, test title & timer cleanly separated above PDF */}
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={nav.pop} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {session.test.title}
        </Text>
        <View style={styles.timerPill}>
          <View style={styles.recordDot} />
          <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
        </View>
      </View>

      <View style={styles.viewerArea}>
        {pdfUrl ? (
          <WebView
            style={{ flex: 1 }}
            originWhitelist={['*']}
            mixedContentMode="always"
            javaScriptEnabled
            domStorageEnabled
            source={{ html: buildPdfViewerHtml(pdfUrl, token) }}
            onError={(e) =>
              setWebViewError(`Could not open the PDF viewer: ${e.nativeEvent.description}`)
            }
            onHttpError={(e) =>
              setWebViewError(`Server error loading PDF (HTTP ${e.nativeEvent.statusCode}).`)
            }
          />
        ) : (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>This test's question paper hasn't been uploaded yet.</Text>
          </View>
        )}

        {!!webViewError && (
          <View style={styles.webViewErrorBanner}>
            <Text style={styles.webViewErrorText}>{webViewError}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.submitBtn}
          onPress={() => setShowSubmitModal(true)}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Test</Text>
          )}
        </Pressable>
      </View>

      <Modal visible={showSubmitModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Submit Test?</Text>
            <Text style={styles.modalDesc}>
              Once submitted, you won't be able to make changes. You can view the answer key right
              after.
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setShowSubmitModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.modalSubmitBtn}
                onPress={() => {
                  setShowSubmitModal(false);
                  handleSubmit();
                }}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 },
  errorText: { color: ERROR, fontSize: 13, textAlign: 'center' },
  webViewErrorBanner: {
    position: 'absolute',
    top: 12,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(251,234,232,0.96)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  webViewErrorText: { color: ERROR, fontSize: 12, textAlign: 'center' },
  retryText: { marginTop: 8, color: NAVY, fontWeight: '700', fontSize: 13 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE4',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 10,
  },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: NAVY },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(22, 49, 92, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(22, 49, 92, 0.15)',
  },
  recordDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: ERROR },
  timerText: { fontSize: 12.5, fontWeight: '800', color: NAVY },
  viewerArea: { flex: 1, backgroundColor: '#EBF0F5' },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDEBE4',
  },
  submitBtn: {
    backgroundColor: NAVY,
    borderRadius: 26,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  modalDesc: { fontSize: 12.5, color: MUTED, marginTop: 8, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: '#D9D6CC',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: { color: NAVY, fontWeight: '700', fontSize: 13.5 },
  modalSubmitBtn: { flex: 1, backgroundColor: NAVY, borderRadius: 24, paddingVertical: 12, alignItems: 'center' },
  modalSubmitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13.5 },
});
