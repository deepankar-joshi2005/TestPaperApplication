/**
 * Loads Razorpay's own Checkout.js from their CDN inside a WebView and opens
 * the standard payment sheet for a single order — the same "generate an HTML
 * string, run it in a WebView" technique this app already uses for PDFs
 * (see utils/pdfViewer.ts), chosen because this app runs on Expo Go and can't
 * link the native react-native-razorpay SDK.
 *
 * Every outcome (success, failure, user-dismissed, load error) is posted back
 * to React Native via window.ReactNativeWebView.postMessage as JSON so the
 * screen hosting the WebView can react without any polling.
 */
export const buildCheckoutHtml = (params: {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
}): string => `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
<style>
  html, body { margin: 0; padding: 0; background: #F5F4EF; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  #status { color: #5B6577; text-align: center; padding: 90px 24px 24px; font-size: 15px; font-weight: 500; }
</style>
</head>
<body>
<div id="status">Opening secure payment…</div>
<script src="https://checkout.razorpay.com/v1/checkout.js" onerror="post({type:'error', message:'Could not load the payment page. Check your internet connection.'})"></script>
<script>
  function post(msg) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
  try {
    var options = {
      key: ${JSON.stringify(params.keyId)},
      order_id: ${JSON.stringify(params.orderId)},
      amount: ${JSON.stringify(params.amount)},
      currency: ${JSON.stringify(params.currency)},
      name: ${JSON.stringify(params.name)},
      description: ${JSON.stringify(params.description)},
      theme: { color: '#16315C' },
      handler: function (response) {
        post({
          type: 'success',
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          post({ type: 'cancelled' });
        },
      },
    };
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) {
      post({ type: 'failed', message: resp.error && resp.error.description });
    });
    rzp.open();
  } catch (e) {
    post({ type: 'error', message: e.message });
  }
</script>
</body>
</html>`;
