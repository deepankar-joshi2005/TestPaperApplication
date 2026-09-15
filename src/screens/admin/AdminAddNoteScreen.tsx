import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminHeader from '../../components/admin/AdminHeader';
import ToggleRow from '../../components/admin/ToggleRow';
import FormInput from '../../components/FormInput';
import PrimaryButton from '../../components/PrimaryButton';
import { AdminNav } from '../../navigation/adminTypes';
import { createNote, getNoteDetail, updateNote } from '../../services/admin/notes.service';
import { uploadDocument } from '../../services/admin/upload.service';
import { MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  subjectId: string;
  noteId?: string;
  nav: AdminNav;
};

export default function AdminAddNoteScreen({ token, subjectId, noteId, nav }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!noteId);

  useEffect(() => {
    if (!noteId) return;
    (async () => {
      try {
        const detail = await getNoteDetail(token, noteId);
        setTitle(detail.title);
        setDescription(detail.description);
        setPdfUrl(detail.pdfUrl);
        setIsActive(detail.isActive);
      } catch (err) {
        Alert.alert('Failed to load chapter', err instanceof Error ? err.message : '');
      } finally {
        setLoading(false);
      }
    })();
  }, [noteId, token]);

  const pickPdf = async () => {
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    setUploading(true);
    try {
      const url = await uploadDocument(token, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
      setPdfUrl(url);
    } catch (err) {
      Alert.alert('Failed to upload PDF', err instanceof Error ? err.message : '');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Chapter title is required');
      return;
    }
    if (!pdfUrl) {
      Alert.alert('Please upload a PDF before saving');
      return;
    }
    setSaving(true);
    try {
      if (noteId) {
        await updateNote(token, noteId, { title: title.trim(), description, pdfUrl, isActive });
      } else {
        await createNote(token, { subject: subjectId, title: title.trim(), description, pdfUrl, isActive });
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
      <AdminHeader title={noteId ? 'Edit Chapter' : 'Add Chapter'} onBack={() => nav.pop()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Chapter Title</Text>
          <FormInput
            icon="bookmark-outline"
            placeholder="e.g. Chapter 3: Newton's Laws"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <FormInput
            icon="document-text-outline"
            placeholder="Short description for students (optional)"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Chapter PDF</Text>
          <Pressable style={styles.dropzone} onPress={pickPdf} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color={NAVY} />
            ) : pdfUrl ? (
              <>
                <Ionicons name="checkmark-circle" size={26} color="#2E9E5B" />
                <Text style={styles.uploadedText}>PDF Uploaded</Text>
                <Text style={styles.replaceText}>Tap to replace</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={26} color={NAVY} />
                <Text style={styles.dropzoneBtnText}>Upload Chapter PDF</Text>
                <Text style={styles.dropzoneHint}>PDF only, max 20MB</Text>
              </>
            )}
          </Pressable>

          <View style={styles.toggleWrap}>
            <ToggleRow
              label="Visible to Students"
              description="Hide this chapter without deleting it"
              value={isActive}
              onChange={setIsActive}
            />
          </View>

          <PrimaryButton
            label="Save Chapter"
            onPress={handleSave}
            loading={saving || loading}
            disabled={!title.trim() || !pdfUrl}
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
    marginBottom: 14,
  },
  dropzoneBtnText: { fontSize: 14, fontWeight: '800', color: NAVY, marginTop: 4 },
  dropzoneHint: { fontSize: 11, color: MUTED },
  uploadedText: { fontSize: 13.5, fontWeight: '800', color: '#2E9E5B', marginTop: 4 },
  replaceText: { fontSize: 11, color: MUTED },
  toggleWrap: { marginTop: 4, marginBottom: 8 },
});
