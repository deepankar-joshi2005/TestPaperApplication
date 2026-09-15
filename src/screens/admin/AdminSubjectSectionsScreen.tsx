import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../components/admin/AdminHeader';
import StepProgressHeader from '../../components/admin/StepProgressHeader';
import ToggleRow from '../../components/admin/ToggleRow';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { AdminNav } from '../../navigation/adminTypes';
import { AdminTestDetail, getTestDetail, setSubjectSections, SubjectSection } from '../../services/admin/tests.service';
import { ERROR, MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  testId: string;
  nav: AdminNav;
};

type EditableSection = SubjectSection;

export default function AdminSubjectSectionsScreen({ token, testId, nav }: Props) {
  const [test, setTest] = useState<AdminTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [sections, setSections] = useState<EditableSection[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await getTestDetail(token, testId);
      setTest(detail);
      setEnabled(detail.subjectSections.length > 0);
      setSections(detail.subjectSections.length > 0 ? detail.subjectSections : []);
    } catch (err) {
      Alert.alert('Failed to load test', err instanceof Error ? err.message : '');
    } finally {
      setLoading(false);
    }
  }, [token, testId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalQuestions = test?.totalQuestions ?? 0;

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    if (value && sections.length === 0) {
      setSections([{ name: '', startNo: 1, endNo: totalQuestions }]);
    }
  };

  const addSection = () => {
    const lastEnd = sections[sections.length - 1]?.endNo ?? 0;
    setSections((prev) => [...prev, { name: '', startNo: lastEnd + 1, endNo: totalQuestions }]);
  };

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSection = (idx: number, patch: Partial<EditableSection>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      await setSubjectSections(token, testId, { enabled, sections });
      nav.push({ name: 'studentPreview', testId });
    } catch (err) {
      Alert.alert('Failed to save', err instanceof Error ? err.message : '');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !test) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <AdminHeader title="Subject Sections" onBack={() => nav.pop()} />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={NAVY} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader title="Subject Sections" subtitle={test.title} onBack={() => nav.pop()} />
      <StepProgressHeader
        steps={['Basic Info', 'Config', 'Questions', 'Preview', 'Publish']}
        currentIndex={3}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ToggleRow
          label="Divide this test by subject"
          description={`Split the ${totalQuestions} questions into named sections (e.g. Reasoning, Maths)`}
          value={enabled}
          onChange={handleToggle}
        />

        {enabled ? (
          <>
            {sections.map((section, idx) => (
              <View key={idx} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Section {idx + 1}</Text>
                  <Pressable onPress={() => removeSection(idx)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={ERROR} />
                  </Pressable>
                </View>
                <FormInput
                  icon="pricetag-outline"
                  placeholder="Subject name (e.g. Reasoning)"
                  value={section.name}
                  onChangeText={(text) => updateSection(idx, { name: text })}
                />
                <View style={styles.rangeRow}>
                  <View style={styles.rangeField}>
                    <Text style={styles.rangeLabel}>From Q.No</Text>
                    <FormInput
                      icon="play-outline"
                      placeholder="1"
                      keyboardType="numeric"
                      value={String(section.startNo)}
                      onChangeText={(text) => updateSection(idx, { startNo: Number(text) || 0 })}
                    />
                  </View>
                  <View style={styles.rangeField}>
                    <Text style={styles.rangeLabel}>To Q.No</Text>
                    <FormInput
                      icon="stop-outline"
                      placeholder={String(totalQuestions)}
                      keyboardType="numeric"
                      value={String(section.endNo)}
                      onChangeText={(text) => updateSection(idx, { endNo: Number(text) || 0 })}
                    />
                  </View>
                </View>
              </View>
            ))}

            <Pressable style={styles.addBtn} onPress={addSection}>
              <Ionicons name="add-circle-outline" size={18} color={NAVY} />
              <Text style={styles.addBtnText}>Add Section</Text>
            </Pressable>

            <Text style={styles.hint}>
              Sections must cover questions 1 to {totalQuestions} in order, with no gaps or
              overlaps.
            </Text>
          </>
        ) : (
          <Text style={styles.hint}>
            This test will be shown to students as one combined set of {totalQuestions}{' '}
            questions.
          </Text>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <PrimaryButton label="Continue to Preview" onPress={handleContinue} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  loadingBox: { paddingVertical: 60, alignItems: 'center' },
  scrollContent: { padding: 18, paddingBottom: 30, gap: 14 },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDEBE4',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: NAVY },
  rangeRow: { flexDirection: 'row', gap: 12 },
  rangeField: { flex: 1 },
  rangeLabel: { fontSize: 11, fontWeight: '700', color: MUTED, marginBottom: 6 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.4,
    borderColor: NAVY,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: NAVY },
  hint: { fontSize: 11.5, color: MUTED, lineHeight: 17 },
  bottomBar: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EDEBE4' },
});
