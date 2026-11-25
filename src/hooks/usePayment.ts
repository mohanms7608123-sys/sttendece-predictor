import { api } from '@/lib/api';
import { toast } from 'sonner';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayPaymentSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayPaymentFailedResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayPaymentFailedResponse) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

interface PaymentOptions {
  orderId: string;
  amount: number;
  userEmail: string;
  userName: string;
  userPhone?: string;
  onSuccess: () => void;
  onFailure: () => void;
}

export function usePayment() {
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async ({
    orderId,
    amount,
    userEmail,
    userName,
    userPhone,
    onSuccess,
    onFailure,
  }: PaymentOptions) => {
    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        onFailure();
        return;
      }

      // Create Razorpay order via MongoDB backend
      const data = await api.post('/payments/create-order', { orderId, amount });

      if (!data || !data.razorpayOrderId) {
        toast.error('Failed to create payment order');
        onFailure();
        return;
      }

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'CampusBite',
        description: `Order Payment #${orderId.slice(0, 8)}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone || '',
        },
        theme: {
          color: '#10B981',
        },
        handler: async function (response: RazorpayPaymentSuccessResponse) {
          try {
            // Verify payment
            const verifyData = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
              amount,
            });

            if (!verifyData?.verified) {
              toast.error('Payment verification failed');
              onFailure();
              return;
            }

            toast.success('Payment successful!');
            onSuccess();
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment verification failed');
            onFailure();
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled');
            onFailure();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: RazorpayPaymentFailedResponse) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        onFailure();
      });
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment: ' + (error.message || 'Error'));
      onFailure();
    }
  };

  return { initiatePayment };
}
