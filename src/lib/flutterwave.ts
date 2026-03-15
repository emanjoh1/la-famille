const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY!;
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

interface FlutterwavePaymentPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
  };
  payment_options: string;
  meta: Record<string, string>;
  customizations: {
    title: string;
    description: string;
  };
}

interface FlutterwavePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

interface FlutterwaveVerifyResponse {
  status: string;
  data: {
    id: number;
    tx_ref: string;
    amount: number;
    currency: string;
    status: string;
    meta: Record<string, string>;
  };
}

export async function createFlutterwavePayment(
  payload: FlutterwavePaymentPayload
): Promise<FlutterwavePaymentResponse> {
  const res = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Flutterwave payment creation failed: ${err}`);
  }

  return res.json();
}

export async function verifyFlutterwaveTransaction(
  transactionId: number
): Promise<FlutterwaveVerifyResponse> {
  const res = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Flutterwave verification failed: ${err}`);
  }

  return res.json();
}
