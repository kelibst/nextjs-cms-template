const PAYSTACK_BASE = 'https://api.paystack.co'

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  }
}

export interface PaystackInitResponse {
  authorizationUrl: string
  accessCode: string
  reference: string
}

export async function initializePayment(params: {
  email: string
  amount: number          // in GHS — multiply by 100 for pesewas
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}): Promise<PaystackInitResponse> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100),   // convert GHS → pesewas
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? 'Paystack initialization failed')
  }
  const data = await res.json() as {
    data: { authorization_url: string; access_code: string; reference: string }
  }
  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  }
}

export async function verifyPayment(reference: string): Promise<{
  status: string          // 'success' | 'failed' | 'abandoned'
  amount: number          // in pesewas
  email: string
  metadata: Record<string, unknown>
}> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: getHeaders() }
  )
  if (!res.ok) throw new Error('Paystack verification failed')
  const data = await res.json() as {
    data: {
      status: string
      amount: number
      customer: { email: string }
      metadata: Record<string, unknown>
    }
  }
  return {
    status: data.data.status,
    amount: data.data.amount,
    email: data.data.customer.email,
    metadata: data.data.metadata,
  }
}
