import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { CREAM, GOLD, GOLD_SOFT, MUTED, NAVY } from '../theme/colors';

type Feature = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

const FEATURES: Feature[] = [
  {
    icon: <Ionicons name="school" size={22} color={NAVY} />,
    title: 'QUALITY\nEDUCATION',
    desc: 'Learn from experienced and dedicated faculty.',
  },
  {
    icon: <Ionicons name="book" size={22} color={NAVY} />,
    title: 'COMPREHENSIVE\nSTUDY MATERIAL',
    desc: 'Well-structured notes and up-to-date resources.',
  },
  {
    icon: <MaterialCommunityIcons name="target" size={22} color={NAVY} />,
    title: 'FOCUSED\nPREPARATION',
    desc: 'Tailored strategies for exams and academic success.',
  },
  {
    icon: <Ionicons name="trending-up" size={22} color={NAVY} />,
    title: 'BETTER\nRESULTS',
    desc: 'Proven track record of excellence.',
  },
];

const BOTTOM_LINKS = [
  { icon: 'shield-checkmark' as const, label: 'TRUST' },
  { icon: 'ribbon' as const, label: 'EXCELLENCE' },
  { icon: 'people' as const, label: 'GUIDANCE' },
  { icon: 'trophy' as const, label: 'SUCCESS' },
];

const REDIRECT_DELAY_MS = 2600;

type Props = {
  onFinish: () => void;
};

export default function LandingScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.root}>
      <Image
        source={require('../../assets/bg-left.png')}
        style={styles.bgLeft}
        resizeMode="cover"
      />
      <Image
        source={require('../../assets/bg-right.png')}
        style={styles.bgRight}
        resizeMode="cover"
      />
      <Image source={require('../../assets/dots-left.png')} style={styles.dotsLeft} />
      <Image source={require('../../assets/dots-right.png')} style={styles.dotsRight} />

      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.welcomeTo}>WELCOME TO</Text>
        <Text style={styles.brandLine1}>DEHRADUN</Text>
        <Text style={styles.brandLine2}>COACHING CENTRE</Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Ionicons name="star" size={11} color={GOLD} style={styles.dividerStar} />
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.tagline}>
          ONE STEP AHEAD{'\n'}IN THE QUEST OF DREAMS.
        </Text>

        <View style={styles.cardsRow}>
          {FEATURES.map((f) => (
            <View style={styles.card} key={f.title}>
              {f.icon}
              <Text style={styles.cardTitle}>{f.title}</Text>
              <View style={styles.cardDivider} />
              <Text style={styles.cardDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.loadingRow}>
          <ActivityIndicator color={GOLD} size="small" />
          <Text style={styles.loadingText}>Getting things ready…</Text>
        </View>

        <View style={styles.footerWrap}>
          <Svg
            width="100%"
            height={56}
            viewBox="0 0 100 56"
            preserveAspectRatio="none"
            style={styles.wave}
          >
            <Defs>
              <LinearGradient id="goldRim" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#F3D27A" />
                <Stop offset="0.5" stopColor="#A8752A" />
                <Stop offset="1" stopColor="#F3D27A" />
              </LinearGradient>
            </Defs>
            <Path
              d="M0,14 C22,14 22,46 50,46 C78,46 78,14 100,14 L100,56 L0,56 Z"
              fill={NAVY}
            />
            <Path
              d="M0,14 C22,14 22,46 50,46 C78,46 78,14 100,14"
              fill="none"
              stroke="url(#goldRim)"
              strokeWidth={2.4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </Svg>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              {BOTTOM_LINKS.map((item) => (
                <View style={styles.footerItem} key={item.label}>
                  <Ionicons name={item.icon} size={22} color={GOLD} />
                  <Text style={styles.footerLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.footerTagline}>Your Success is Our Mission</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },
  bgLeft: {
    position: 'absolute',
    top: 222,
    left: 0,
    width: 118,
    aspectRatio: 140 / 1000,
  },
  bgRight: {
    position: 'absolute',
    top: 222,
    right: 0,
    width: 124,
    aspectRatio: 148 / 1000,
  },
  dotsLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 64,
    height: 64,
  },
  dotsRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 64,
    height: 64,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 36,
    paddingHorizontal: 22,
  },
  logo: {
    width: 176,
    height: 193,
    alignSelf: 'center',
  },
  welcomeTo: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    color: NAVY,
    textAlign: 'center',
  },
  brandLine1: {
    marginTop: 4,
    fontSize: 32,
    fontWeight: '800',
    color: NAVY,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  brandLine2: {
    marginTop: -4,
    fontSize: 24,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '55%',
    marginTop: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: GOLD_SOFT,
  },
  dividerStar: {
    marginHorizontal: 10,
  },
  tagline: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
    textAlign: 'center',
    lineHeight: 21,
  },
  cardsRow: {
    flexDirection: 'row',
    width: '100%',
    minWidth: 0,
    marginTop: 22,
  },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 5,
    marginHorizontal: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: '700',
    color: NAVY,
    textAlign: 'center',
    lineHeight: 12,
  },
  cardDivider: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: GOLD,
    marginVertical: 6,
  },
  cardDesc: {
    fontSize: 8,
    color: '#5B6577',
    textAlign: 'center',
    lineHeight: 10.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 8,
    gap: 10,
  },
  loadingText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: MUTED,
    letterSpacing: 0.3,
  },
  footerWrap: {
    flex: 1,
    marginTop: 18,
    marginHorizontal: -22,
  },
  wave: {
    marginBottom: -1,
  },
  footer: {
    flex: 1,
    backgroundColor: NAVY,
    paddingTop: 4,
    paddingBottom: 24,
    paddingHorizontal: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  footerItem: {
    flex: 1,
    alignItems: 'center',
  },
  footerLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footerTagline: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.92,
  },
});
