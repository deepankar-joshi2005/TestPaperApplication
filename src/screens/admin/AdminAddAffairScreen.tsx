import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
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
import {
  createCurrentAffair,
  CurrentAffairPeriod,
  CurrentAffairType,
} from '../../services/admin/currentAffairs.service';
import { uploadDocument } from '../../services/admin/upload.service';
import { GOLD, MUTED, NAVY } from '../../theme/colors';

type Props = {
  token: string;
  nav: AdminNav;
  initialType?: CurrentAffairType;
};

const TYPES: { key: CurrentAffairType; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    key: 'national',
    title: 'National Current Affairs',
    subtitle: 'India-wide events, national schemes, polity & economy',
    icon: 'flag-outline',
  },
  {
    key: 'uttarakhand',
    title: 'Uttarakhand Current Affairs',
    subtitle: 'UKPSC, UKSSSC, state schemes, news & cultural affairs',
    icon: 'trail-sign-outline',
  },
  {
    key: 'international',
    title: 'International Current Affairs',
    subtitle: 'Global summits, treaties, foreign policy & world news',
    icon: 'globe-outline',
  },
];

const PERIODS: { key: CurrentAffairPeriod; title: string; badge: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'weekly', title: 'Weekly', badge: '7 Days Digest', icon: 'calendar-clear-outline' },
  { key: 'monthly', title: 'Monthly', badge: 'Complete Month', icon: 'calendar-outline' },
  { key: 'half_yearly', title: '6 Months', badge: 'Half-Yearly Roundup', icon: 'layers-outline' },
  { key: 'yearly', title: 'Yearly', badge: 'Full Year Compendium', icon: 'trophy-outline' },
];

export default function AdminAddAffairScreen({ token, nav, initialType = 'national' }: Props) {
  const [type, setType] = useState<CurrentAffairType>(initialType);
  const [period, setPeriod] = useState<CurrentAffairPeriod>('monthly');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickPdf = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (picked.canceled || !picked.assets?.[0]) return;
      const asset = picked.assets[0];

      setUploading(true);
      const url = await uploadDocument(token, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });
      setPdfUrl(url);
      setPdfFileName(asset.name);
    } catch (err) {
      Alert.alert('Upload Failed', err instanceof Error ? err.message : 'Could not upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for this Current Affairs digest.');
      return;
    }
    if (!pdfUrl) {
      Alert.alert('PDF Missing', 'Please select and upload a Current Affairs PDF document.');
      return;
    }

    setSaving(true);
    try {
      await createCurrentAffair(token, {
        type,
        period,
        title: title.trim(),
        description: description.trim(),
        pdfUrl,
        notifyStudents,
        isActive: true,
      });

      Alert.alert(
        'Published Successfully',
        notifyStudents
          ? 'Current affairs PDF has been published and all students have been notified!'
          : 'Current affairs PDF has been published successfully.'
      );
      nav.pop();
    } catch (err) {
      Alert.alert('Failed to save', err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AdminHeader title="Upload Current Affairs" onBack={() => nav.pop()} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 1: Category Selection */}
          <Text style={styles.stepTitle}>1. Select Scope / Region</Text>
          <Text style={styles.stepSub}>Choose whether this is National or Uttarakhand Current Affairs</Text>
          <View style={styles.typesGrid}>
            {TYPES.map((t) => {
              const selected = type === t.key;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.typeCard, selected && styles.typeCardSelected]}
                  onPress={() => setType(t.key)}
                >
                  <View style={[styles.typeIconWrap, selected && styles.typeIconWrapSelected]}>
                    <Ionicons name={t.icon} size={22} color={selected ? '#FFFFFF' : NAVY} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.typeCardTitle, selected && styles.typeCardTitleSelected]}>
                      {t.title}
                    </Text>
                    <Text style={styles.typeCardSub} numberOfLines={2}>
                      {t.subtitle}
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? NAVY : MUTED}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Step 2: Period Selection */}
          <Text style={[styles.stepTitle, { marginTop: 22 }]}>2. Select Period / Frequency</Text>
          <Text style={styles.stepSub}>
            Weekly, Monthly, 6 Months (Half-Yearly), or Yearly Compendium
          </Text>
          <View style={styles.periodsGrid}>
            {PERIODS.map((p) => {
              const selected = period === p.key;
              return (
                <Pressable
                  key={p.key}
                  style={[styles.periodCard, selected && styles.periodCardSelected]}
                  onPress={() => setPeriod(p.key)}
                >
                  <Ionicons name={p.icon} size={22} color={selected ? GOLD : NAVY} />
                  <Text style={[styles.periodTitle, selected && styles.periodTitleSelected]}>
                    {p.title}
                  </Text>
                  <Text style={[styles.periodBadge, selected && styles.periodBadgeSelected]}>
                    {p.badge}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Step 3: Title & Description */}
          <Text style={[styles.stepTitle, { marginTop: 22 }]}>3. Details</Text>
          <Text style={styles.label}>Digest Title *</Text>
          <FormInput
            icon="newspaper-outline"
            placeholder="e.g. August 2026 Monthly Digest (Hindi & English)"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Highlights / Description (Optional)</Text>
          <FormInput
            icon="document-text-outline"
            placeholder="Key topics covered: Budget, appointments, awards, sports..."
            value={description}
            onChangeText={setDescription}
          />

          {/* Step 4: PDF Upload */}
          <Text style={[styles.stepTitle, { marginTop: 18 }]}>4. Upload PDF Document</Text>
          <Pressable style={styles.dropzone} onPress={pickPdf} disabled={uploading}>
            {uploading ? (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color={NAVY} size="large" />
                <Text style={styles.dropzoneHint}>Uploading PDF file...</Text>
              </View>
            ) : pdfUrl ? (
              <View style={{ alignItems: 'center', gap: 6, paddingHorizontal: 16 }}>
                <Ionicons name="checkmark-circle" size={32} color="#2E9E5B" />
                <Text style={styles.uploadedText}>PDF Ready to Publish</Text>
                {!!pdfFileName && (
                  <Text style={styles.uploadedFileName} numberOfLines={1}>
                    📄 {pdfFileName}
                  </Text>
                )}
                <Text style={styles.replaceText}>Tap to choose a different PDF</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 6 }}>
                <View style={styles.uploadIconCircle}>
                  <Ionicons name="cloud-upload-outline" size={28} color={NAVY} />
                </View>
                <Text style={styles.dropzoneBtnText}>Select Affairs PDF</Text>
                <Text style={styles.dropzoneHint}>PDF document up to 50MB</Text>
              </View>
            )}
          </Pressable>

          {/* Step 5: Notification Option */}
          <View style={styles.toggleWrap}>
            <ToggleRow
              label="Notify All Students"
              description="Sends an instant push notification to every student informing them about this new digest."
              value={notifyStudents}
              onChange={setNotifyStudents}
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              label={saving ? 'Publishing...' : 'Publish Current Affairs'}
              onPress={handleSave}
              loading={saving}
              disabled={!title.trim() || !pdfUrl || uploading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F4EF' },
  scrollContent: { padding: 18, paddingBottom: 50 },
  stepTitle: { fontSize: 15, fontWeight: '800', color: NAVY, marginBottom: 2 },
  stepSub: { fontSize: 12, color: MUTED, marginBottom: 12 },
  typesGrid: { gap: 10 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EDEBE4',
  },
  typeCardSelected: {
    borderColor: NAVY,
    backgroundColor: '#F0F4FA',
  },
  typeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconWrapSelected: {
    backgroundColor: NAVY,
  },
  typeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: NAVY,
  },
  typeCardTitleSelected: {
    color: NAVY,
    fontWeight: '800',
  },
  typeCardSub: {
    fontSize: 11.5,
    color: MUTED,
    marginTop: 2,
  },
  periodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  periodCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EDEBE4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  periodCardSelected: {
    borderColor: NAVY,
    backgroundColor: '#16315C',
  },
  periodTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: NAVY,
    marginTop: 2,
  },
  periodTitleSelected: {
    color: '#FFFFFF',
  },
  periodBadge: {
    fontSize: 10.5,
    fontWeight: '600',
    color: MUTED,
    textAlign: 'center',
  },
  periodBadgeSelected: {
    color: '#E0E7FF',
  },
  label: { fontSize: 12.5, fontWeight: '700', color: NAVY, marginBottom: 8, marginTop: 10 },
  dropzone: {
    borderWidth: 1.8,
    borderColor: NAVY,
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    marginBottom: 14,
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneBtnText: { fontSize: 14, fontWeight: '800', color: NAVY },
  dropzoneHint: { fontSize: 11, color: MUTED },
  uploadedText: { fontSize: 14, fontWeight: '800', color: '#2E9E5B' },
  uploadedFileName: { fontSize: 11.5, fontWeight: '600', color: NAVY, maxWidth: 260 },
  replaceText: { fontSize: 11, color: MUTED, textDecorationLine: 'underline', marginTop: 2 },
  toggleWrap: { marginTop: 4, marginBottom: 12 },
});
