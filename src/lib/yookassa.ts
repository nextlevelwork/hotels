const YOOKASSA_API = 'https://api.yookassa.ru/v3/payments';

function getAuth(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secretKey) {
    throw new Error('YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY must be set');
  }
  return Buffer.from(`${shopId}:${secretKey}`).toString('base64');
}

interface CreatePaymentParams {
  amount: number;
  description: string;
  bookingId: string;
  returnUrl: string;
  paymentMethod?: 'bank_card' | 'sbp';
}

interface YooKassaPayment {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
  amount: {
    value: string;
    currency: string;
  };
}

export async function createPayment({
  amount,
  description,
  bookingId,
  returnUrl,
  paymentMethod,
}: CreatePaymentParams): Promise<YooKassaPayment> {
  const body: Record<string, unknown> = {
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    confirmation: {
      type: 'redirect',
      return_url: returnUrl,
    },
    capture: true,
    description,
    metadata: {
      bookingId,
    },
  };

  if (paymentMethod === 'sbp') {
    body.payment_method_data = { type: 'sbp' };
  } else if (paymentMethod === 'bank_card') {
    body.payment_method_data = { type: 'bank_card' };
  }

  const res = await fetch(YOOKASSA_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${getAuth()}`,
      'Idempotence-Key': bookingId,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`YooKassa error: ${res.status} ${error}`);
  }

  return res.json();
}

export async function getPayment(paymentId: string): Promise<YooKassaPayment> {
  const res = await fetch(`${YOOKASSA_API}/${paymentId}`, {
    headers: {
      'Authorization': `Basic ${getAuth()}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`YooKassa error: ${res.status} ${error}`);
  }

  return res.json();
}
