// Loads Razorpay Standard Checkout (https://checkout.razorpay.com/v1/checkout.js) on demand and
// opens it for an order created by our backend. Only the public key id reaches the browser.

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error: { description?: string; reason?: string };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", callback: (response: RazorpayFailure) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<boolean> | null = null;

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  loading ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      loading = null; // allow a retry
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return loading;
}

export type CheckoutResult =
  | { status: "success"; response: RazorpaySuccess }
  | { status: "dismissed" }
  | { status: "failed"; message: string };

/** Opens the Razorpay payment window and resolves when it succeeds, fails or is closed. */
export function openCheckout(options: Omit<RazorpayOptions, "handler" | "modal">): Promise<CheckoutResult> {
  return new Promise((resolve) => {
    if (!window.Razorpay) {
      resolve({ status: "failed", message: "Payment window failed to load." });
      return;
    }
    let settled = false;
    const finish = (result: CheckoutResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    const checkout = new window.Razorpay({
      ...options,
      handler: (response) => finish({ status: "success", response }),
      modal: { ondismiss: () => finish({ status: "dismissed" }) },
    });
    checkout.on("payment.failed", (response) =>
      finish({ status: "failed", message: response.error.description ?? "Payment failed." }),
    );
    checkout.open();
  });
}
