import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../components/admin/AdminHeader';
import ToggleRow from '../../components/admin/ToggleRow';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { AdminNav } from '../../navigation/adminTypes';
import {
  createNotesSubject,
  getNotesSubjectDetail,
  updateNotesSubject,
} from '../../services/admin/notesSubjects.service';
import { NAVY } from '../../theme/colors';

type Props = {
  token: string;
  category: string;
  subjectId?: string;
  nav: AdminNav;
};

export default function AdminAddSubjectScreen({ token, category, subjectId, nav }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!subjectId);

  useEffect(() => {
    if (!subjectId) return;
    (async () => {
      try {
        const detail = await getNotesSubjectDetail(token, subjectId);
        setName(detail.name);
        setDescription(detail.description);
        setDisplayOrder(String(detail.displayOrder));
        setIsActive(detail.isActive);
      } catch (err) {
        Alert.alert('Failed to load subject', err instanceof Error ? err.message : '');
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId, token]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Subject name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category,
        name: name.trim(),
        description,
        displayOrder: Number(displayOrder) || 0,
        isActive,
      };
      if (subjectId) {
        await updateNotesSubject(token, subjectId, payload);
      } else {
        await createNotesSubject(token, payload);
      }
      nav.pop();
    } catch (err) {
      Alert.alert('Failed to save', err instanceof Error ? err.message : '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader
        title={subjectId ? 'Edit Subject' : 'Add Subject'}
        subtitle={category}
        onBack={() => nav.pop()}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Subject Name</Text>
          <FormInput
            icon="library-outline"
            placeholder="e.g. Physics"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Description</Text>
          <FormInput
            icon="document-text-outline"
            placeholder="Short description for students (optional)"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Display Order</Text>
          <FormInput
            icon="swap-vertical-outline"
            placeholder="0"
            value={displayOrder}
            onChangeText={setDisplayOrder}
            keyboardType="numeric"
          />

          <View style={styles.toggleWrap}>
            <ToggleRow
              label="Visible to Students"
              description="Hide this subject without deleting it"
              value={isActive}
              onChange={setIsActive}
            />
          </View>

          <PrimaryButton
            label="Save Subject"
            onPress={handleSave}
            loading={saving || loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  scrollContent: { padding: 18, paddingBottom: 40 },
  label: { fontSize: 12.5, fontWeight: '700', color: NAVY, marginBottom: 8, marginTop: 4 },
  toggleWrap: { marginTop: 10, marginBottom: 8 },
});
