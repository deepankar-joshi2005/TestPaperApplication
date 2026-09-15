import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../components/admin/AdminHeader';
import StepProgressHeader from '../../components/admin/StepProgressHeader';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { AdminNav } from '../../navigation/adminTypes';
import { getSeriesDetail } from '../../services/admin/series.service';
import {
  createTest,
  getTestDetail,
  TestFormat,
  updateTestConfig,
} from '../../services/admin/tests.service';
import { MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  seriesId: string;
  testId?: string;
  nav: AdminNav;
};

const DIFFICULTIES = ['Easy', 'Moderate', 'Hard', 'Mixed'];

export default function AdminCreateTestStep1Screen({ token, seriesId, testId, nav }: Props) {
  const [seriesTitle, setSeriesTitle] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Multiple Subjects');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Mixed');
  const [format, setFormat] = useState<TestFormat>('mcq');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const series = await getSeriesDetail(token, seriesId);
        setSeriesTitle(series.title);
        if (testId) {
          const test = await getTestDetail(token, testId);
          setTitle(test.title);
          setSubject(test.subject);
          setDescription(test.description);
          setDifficulty(test.difficulty);
          setFormat(test.format);
        }
      } catch (err) {
        Alert.alert('Failed to load', err instanceof Error ? err.message : '');
      } finally {
        setLoading(false);
      }
    })();
  }, [seriesId, testId, token]);

  const handleContinue = async () => {
    if (!title.trim()) {
      Alert.alert('Test name is required');
      return;
    }
    setSaving(true);
    try {
      let resolvedTestId = testId;
      if (testId) {
        await updateTestConfig(token, testId, {
          title: title.trim(),
          subject,
          description,
          difficulty,
          format,
        });
      } else {
        const created = await createTest(token, {
          title: title.trim(),
          series: seriesId,
          subject,
          description,
          difficulty,
          format,
        });
        resolvedTestId = created._id;
      }
      nav.replace({ name: 'createTestStep2', testId: resolvedTestId! });
    } catch (err) {
      Alert.alert('Failed to save test', err instanceof Error ? err.message : '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader title="Create Test" subtitle="Step 1 of 5" onBack={() => nav.pop()} />
      <StepProgressHeader
        steps={['Basic Info', 'Config', 'Questions', 'Preview', 'Publish']}
        currentIndex={0}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Test Name</Text>
          <FormInput
            icon="document-text-outline"
            placeholder="SSC CGL Mock Test – 01"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Test Format</Text>
          <View style={styles.formatRow}>
            <Pressable
              style={[styles.formatCard, format === 'mcq' && styles.formatCardActive]}
              onPress={() => setFormat('mcq')}
            >
              <Text style={[styles.formatTitle, format === 'mcq' && styles.formatTitleActive]}>
                MCQ Test
              </Text>
              <Text style={[styles.formatDesc, format === 'mcq' && styles.formatDescActive]}>
                Question bank, options, auto-scoring
              </Text>
            </Pressable>
            <Pressable
              style={[styles.formatCard, format === 'pdf' && styles.formatCardActive]}
              onPress={() => setFormat('pdf')}
            >
              <Text style={[styles.formatTitle, format === 'pdf' && styles.formatTitleActive]}>
                PDF Test
              </Text>
              <Text style={[styles.formatDesc, format === 'pdf' && styles.formatDescActive]}>
                Upload question paper + answer key as PDF/image
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Select Test Series</Text>
          <View style={styles.readonlyField}>
            <Text style={styles.readonlyText}>{seriesTitle || 'Loading...'}</Text>
          </View>

          <Text style={styles.label}>Subject</Text>
          <FormInput
            icon="book-outline"
            placeholder="Multiple Subjects"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.label}>Description</Text>
          <FormInput
            icon="reader-outline"
            placeholder="Enter detailed test instructions and guidelines for students..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={[styles.label, { marginTop: 6 }]}>Difficulty Level</Text>
          <View style={styles.pillRow}>
            {DIFFICULTIES.map((d) => (
              <Pressable
                key={d}
                style={[styles.pill, difficulty === d && styles.pillActive]}
                onPress={() => setDifficulty(d)}
              >
                <Text style={[styles.pillText, difficulty === d && styles.pillTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton label="SAVE & CONTINUE" onPress={handleContinue} loading={saving || loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  scrollContent: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 12.5, fontWeight: '700', color: NAVY, marginBottom: 8, marginTop: 4 },
  readonlyField: {
    backgroundColor: '#F1F0EA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E5DE',
    paddingHorizontal: 14,
    height: 50,
    justifyContent: 'center',
    marginBottom: 14,
  },
  readonlyText: { fontSize: 14, color: NAVY, fontWeight: '600' },
  formatRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  formatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D9D6CC',
    padding: 14,
  },
  formatCardActive: { borderColor: NAVY, backgroundColor: '#EEF1F7' },
  formatTitle: { fontSize: 13.5, fontWeight: '800', color: MUTED },
  formatTitleActive: { color: NAVY },
  formatDesc: { fontSize: 10.5, color: MUTED, marginTop: 4 },
  formatDescActive: { color: NAVY },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9D6CC',
    backgroundColor: '#FFFFFF',
  },
  pillActive: { backgroundColor: NAVY, borderColor: NAVY },
  pillText: { fontSize: 12.5, fontWeight: '600', color: MUTED },
  pillTextActive: { color: '#FFFFFF' },
});
