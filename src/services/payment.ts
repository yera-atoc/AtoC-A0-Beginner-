import { supabase } from '../lib/supabase';

interface PaymentRequest {
  userId: string;
  courseId: string;
  amount: number;
  currency?: string;
}

export async function initiatePayment(request: PaymentRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      throw new Error(`Payment failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}

export async function recordPayment(
  userId: string,
  courseId: string,
  amountCents: number,
  stripePaymentId?: string
) {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      course_id: courseId,
      amount_cents: amountCents,
      stripe_payment_id: stripePaymentId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function grantCourseAccess(userId: string, courseId: string, accessType: 'subscription' | 'lifetime' = 'lifetime') {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      course_id: courseId,
      access_type: accessType,
      is_active: true,
      purchased_at: new Date().toISOString(),
    })
    .select();

  if (error) throw error;
  return data?.[0];
}
