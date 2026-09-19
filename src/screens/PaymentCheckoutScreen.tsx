import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Nav, PurchasableItemType } from '../navigation/types';
import { createOrder, verifyPayment } from '../services/payments.service';
import { ERROR, MUTED, NAVY } from '../theme/colors';
import { buildCheckoutHtml } from '../utils/razorpayCheckout';

type Props = {
  token: string;
  itemType: PurchasableItemType;
  itemId: string;
  itemTitle: string;
  price: number;
  nav: Nav;
};

type Phase = 'starting' | 'paying' | 'verifying' | 'success' | 'cancelled' | 'error';

export default function PaymentCheckoutScreen({
  token,
  itemType,
  itemId,
  itemTitle,
  price,
  nav,
}: Props) {
  const [phase, setPhase] = useState<Phase>('starting');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  const startOrder = async () => {
    try {
      const order = await createOrder(token, itemType, itemId);
      setCheckoutHtml(
        buildCheckoutHtml({
          keyId: order.keyId,
          orderId: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: 'Dehradun Coaching Centre',
          description: order.itemTitle,
        })
      );
      setPhase('paying');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start payment.');
      setPhase('error');
    }
  };

  useEffect(() => {
    startOrder();
  }, [token, itemType, itemId]);

  const handleMessage = async (event: WebViewMessageEvent) => {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    if (data.type === 'success') {
      setPhase('verifying');
      try {
        await verifyPayment(token, {
          razorpay_order_id: data.razorpay_order_id as string,
          razorpay_payment_id: data.razorpay_payment_id as string,
          razorpay_signature: data.razorpay_signature as string,
        });
        setPhase('success');
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Payment verification failed.');
        setPhase('error');
      }
    } else if (data.type === 'cancelled') {
      setPhase('cancelled');
    } else if (data.type === 'failed' || data.type === 'error') {
      setErrorMessage((data.message as string) || 'Payment failed. Please try again.');
      setPhase('error');
    }
  };

  const retry = () => {
    setPhase('starting');
    setErrorMessage('');
    setCheckoutHtml(null);
    startOrder();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={nav.pop} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={NAVY} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {itemTitle}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      {(phase === 'starting' || phase === 'verifying') && (
        <View style={styles.centerBox}>
          <ActivityIndicator color={NAVY} size="large" />
          <Text style={styles.statusText}>
            {phase === 'starting' ? 'Preparing your payment…' : 'Confirming your payment…'}
          </Text>
        </View>
      )}

      {phase === 'paying' && checkoutHtml && (
        <WebView
          style={{ flex: 1 }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          source={{ html: checkoutHtml }}
          onMessage={handleMessage}
        />
      )}

      {phase === 'success' && (
        <View style={styles.centerBox}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Payment Successful</Text>
          <Text style={styles.statusText}>
            {itemTitle} is now unlocked. Enjoy full access!
          </Text>
          <Pressable style={styles.primaryBtn} onPress={nav.pop}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </Pressable>
        </View>
      )}

      {phase === 'cancelled' && (
        <View style={styles.centerBox}>
          <Ionicons name="close-circle-outline" size={40} color={MUTED} />
          <Text style={styles.statusText}>Payment was cancelled.</Text>
          <Pressable style={styles.primaryBtn} onPress={retry}>
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </Pressable>
          <Pressable onPress={nav.pop} style={{ marginTop: 12 }}>
            <Text style={styles.linkText}>Go Back</Text>
          </Pressable>
        </View>
      )}

      {phase === 'error' && (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={40} color={ERROR} />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable style={styles.primaryBtn} onPress={retry}>
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </Pressable>
          <Pressable onPress={nav.pop} style={{ marginTop: 12 }}>
            <Text style={styles.linkText}>Go Back</Text>
          </Pressable>
        </View>
      )}
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
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: NAVY },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  statusText: { fontSize: 13.5, color: MUTED, textAlign: 'center', lineHeight: 19 },
  errorText: { fontSize: 13.5, color: ERROR, textAlign: 'center', lineHeight: 19 },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E9E5B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: { fontSize: 17, fontWeight: '800', color: NAVY },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: NAVY,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  linkText: { color: NAVY, fontWeight: '700', fontSize: 13 },
});
