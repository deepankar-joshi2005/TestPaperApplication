import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../components/admin/AdminHeader';
import StepProgressHeader from '../../components/admin/StepProgressHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { AdminNav } from '../../navigation/adminTypes';
import { AnswerKeyType, getTestDetail, updateTestConfig } from '../../services/admin/tests.service';
import { uploadDocument } from '../../services/admin/upload.service';
import { MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  testId: string;
  nav: AdminNav;
};

export default function AdminUploadTestPdfScreen({ token, testId, nav }: Props) {
  const [questionPdfUrl, setQuestionPdfUrl] = useState<string | null>(null);
  const [answerKeyUrl, setAnswerKeyUrl] = useState<string | null>(null);
  const [answerKeyType, setAnswerKeyType] = useState<AnswerKeyType | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingQuestion, setUploadingQuestion] = useState(false);
  const [uploadingAnswerKey, setUploadingAnswerKey] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const test = await getTestDetail(token, testId);
        setQuestionPdfUrl(test.questionPdfUrl);
        setAnswerKeyUrl(test.answerKeyUrl);
        setAnswerKeyType(test.answerKeyType);
      } catch (err) {
        Alert.alert('Failed to load test', err instanceof Error ? err.message : '');
      } finally {
        setLoading(false);
      }
    })();
  }, [testId, token]);

  const pickQuestionPdf = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    setUploadingQuestion(true);
    try {
      const url = await uploadDocument(token, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
      await updateTestConfig(token, testId, { questionPdfUrl: url });
      setQuestionPdfUrl(url);
    } catch (err) {
      Alert.alert('Failed to upload question PDF', err instanceof Error ? err.message : '');
    } finally {
      setUploadingQuestion(false);
    }
  };

  const pickAnswerKey = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    const type: AnswerKeyType = asset.mimeType?.startsWith('image/') ? 'image' : 'pdf';
    setUploadingAnswerKey(true);
    try {
      const url = await uploadDocument(token, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
      await updateTestConfig(token, testId, { answerKeyUrl: url, answerKeyType: type });
      setAnswerKeyUrl(url);
      setAnswerKeyType(type);
    } catch (err) {
      Alert.alert('Failed to upload answer key', err instanceof Error ? err.message : '');
    } finally {
      setUploadingAnswerKey(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <AdminHeader title="Upload Test PDF" onBack={() => nav.pop()} />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={NAVY} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader title="Upload Test PDF" subtitle="Step 3 of 4" onBack={() => nav.pop()} />
      <StepProgressHeader
        steps={['Basic Info', 'Config', 'Upload PDF', 'Publish']}
        currentIndex={2}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Question Paper (PDF) — Required</Text>
        <Text style={styles.hint}>
          Students will see this exact PDF, page by page, when they start the test.
        </Text>
        <Pressable style={styles.dropzone} onPress={pickQuestionPdf} disabled={uploadingQuestion}>
          {uploadingQuestion ? (
            <ActivityIndicator color={NAVY} />
          ) : questionPdfUrl ? (
            <>
              <Ionicons name="checkmark-circle" size={26} color="#2E9E5B" />
              <Text style={styles.uploadedText}>Question PDF Uploaded</Text>
              <Text style={styles.replaceText}>Tap to replace</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={26} color={NAVY} />
              <Text style={styles.dropzoneBtnText}>Upload Question PDF</Text>
              <Text style={styles.dropzoneHint}>PDF only, max 20MB</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Answer Key (PDF or Image) — Optional
        </Text>
        <Text style={styles.hint}>
          Shown to students only after they submit the test, in "View Answer".
        </Text>
        <Pressable style={styles.dropzone} onPress={pickAnswerKey} disabled={uploadingAnswerKey}>
          {uploadingAnswerKey ? (
            <ActivityIndicator color={NAVY} />
          ) : answerKeyUrl ? (
            <>
              <Ionicons name="checkmark-circle" size={26} color="#2E9E5B" />
              <Text style={styles.uploadedText}>
                Answer Key Uploaded ({answerKeyType === 'image' ? 'Image' : 'PDF'})
              </Text>
              <Text style={styles.replaceText}>Tap to replace</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={26} color={NAVY} />
              <Text style={styles.dropzoneBtnText}>Upload Answer Key</Text>
              <Text style={styles.dropzoneHint}>PDF or Image, max 20MB</Text>
            </>
          )}
        </Pressable>

        <PrimaryButton
          label="Continue to Publish"
          onPress={() => nav.push({ name: 'publishTest', testId })}
          disabled={!questionPdfUrl}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  loadingBox: { paddingVertical: 60, alignItems: 'center' },
  scrollContent: { padding: 18, paddingBottom: 40 },
  sectionTitle: { fontSize: 14.5, fontWeight: '800', color: NAVY, marginBottom: 6 },
  hint: { fontSize: 11.5, color: MUTED, marginBottom: 12, lineHeight: 16 },
  dropzone: {
    borderWidth: 1.5,
    borderColor: NAVY,
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  dropzoneBtnText: { fontSize: 14, fontWeight: '800', color: NAVY, marginTop: 4 },
  dropzoneHint: { fontSize: 11, color: MUTED },
  uploadedText: { fontSize: 13.5, fontWeight: '800', color: '#2E9E5B', marginTop: 4 },
  replaceText: { fontSize: 11, color: MUTED },
});
