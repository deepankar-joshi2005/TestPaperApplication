import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REDIRECT_DELAY_MS = 5000; // 5 seconds display time before going to login

type Props = {
  onFinish: () => void;
};

export default function LandingScreen({ onFinish }: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const timer = setTimeout(onFinish, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StatusBar style="dark" />
      <Pressable onPress={onFinish} style={styles.pressable}>
        <Image
          source={require('../../assets/landing-page.png')}
          style={styles.image}
          resizeMode="stretch"
        />

        {/* Active animated spinning loader positioned precisely over the static icon in the button */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF6',
  },
  pressable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    top: '83.27%',
    left: '40.82%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#03407E', // Matching blue background of button
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  spinner: {
    transform: [{ scale: 0.75 }],
  },
});
