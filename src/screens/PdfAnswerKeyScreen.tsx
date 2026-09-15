import { Ionicons } from '@expo/vector-icons';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { resolveAssetUrl } from '../config/api';
import { Nav } from '../navigation/types';
import { getResult } from '../services/attempts.service';
import { ERROR, MUTED, NAVY } from '../theme/colors';
import { buildPdfViewerHtml } from '../utils/pdfViewer';

type Props = {
  token: string;
  attemptId: string;
  nav: Nav;
};

export default function PdfAnswerKeyScreen({ token, attemptId, nav }: Props) {
  // Blocks screenshots & screen recording while this screen is open.
  usePreventScreenCapture();
  const [answerKeyUrl, setAnswerKeyUrl] = useState<string | null>(null);
  const [answerKeyType, setAnswerKeyType] = useState<'pdf' | 'image' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [webViewError, setWebViewError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const result = await getResult(token, attemptId);
        if (result.format === 'pdf') {
          setAnswerKeyUrl(result.answerKeyUrl);
          setAnswerKeyType(result.answerKeyType);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load answer key.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, attemptId]);

  const resolvedUrl = resolveAssetUrl(answerKeyUrl);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Structured Header Bar — Back button & Answer Key Title */}
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={nav.pop} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Answer Key
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator color={NAVY} size="large" />
          </View>
        )}

        {!loading && !!error && (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !resolvedUrl && (
          <View style={styles.centerBox}>
            <Ionicons name="document-outline" size={36} color={MUTED} />
            <Text style={styles.emptyText}>
              The admin hasn't uploaded an answer key for this test yet.
            </Text>
          </View>
        )}

        {!loading && resolvedUrl && answerKeyType === 'image' && (
          <Image source={{ uri: resolvedUrl }} style={styles.image} resizeMode="contain" />
        )}

        {!loading && resolvedUrl && answerKeyType === 'pdf' && (
          <WebView
            style={{ flex: 1 }}
            originWhitelist={['*']}
            mixedContentMode="always"
            javaScriptEnabled
            domStorageEnabled
            source={{ html: buildPdfViewerHtml(resolvedUrl) }}
            onError={(e) =>
              setWebViewError(`Could not open the PDF viewer: ${e.nativeEvent.description}`)
            }
            onHttpError={(e) =>
              setWebViewError(`Server error loading PDF (HTTP ${e.nativeEvent.statusCode}).`)
            }
          />
        )}

        {!!webViewError && (
          <View style={styles.webViewErrorBanner}>
            <Text style={styles.webViewErrorText}>{webViewError}</Text>
          </View>
        )}
      </View>
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
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEBE4',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    zIndex: 10,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: NAVY },
  content: { flex: 1, backgroundColor: '#EBF0F5' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 30 },
  errorText: { color: ERROR, fontSize: 13, textAlign: 'center' },
  emptyText: { color: MUTED, fontSize: 13, textAlign: 'center' },
  image: { flex: 1, width: '100%', backgroundColor: '#EBF0F5' },
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
});
