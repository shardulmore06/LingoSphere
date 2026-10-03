import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const LANGUAGE_PLANS: Record<string, { name: string; price: number }> = {
  '67e175c1-9f62-4e97-ac53-09c4e5b7e840': {
    name: 'German',
    price: 499,
  },
  '6ce6d62a-1913-42d3-a42f-e1b10bee38e9': {
    name: 'English',
    price: 499,
  },
  'ed73cfb8-154a-4ec3-a0c0-4c887cab8f5f': {
    name: 'Spanish',
    price: 499,
  },
  '73d754b8-c884-473e-b9aa-b1527efc603e': {
    name: 'French',
    price: 499,
  },
  'b504ec8a-f464-4e7d-a746-94ed0c7d8221': {
    name: 'Italian',
    price: 499,
  },
  '29da528c-04f9-40b0-96ac-4a6315b7c137': {
    name: 'Japanese',
    price: 499,
  },
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      languageId,
    } = body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !languageId
    ) {
      return NextResponse.json(
        { error: 'Missing payment information' },
        { status: 400 }
      );
    }

    const language = LANGUAGE_PLANS[languageId];

    if (!language) {
      return NextResponse.json(
        { error: 'Invalid language selected' },
        { status: 400 }
      );
    }

    /*
     * Check whether this payment was already processed.
     */
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id, subscription_id, status')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .maybeSingle();

    if (existingPayment?.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: `${language.name} is already unlocked.`,
        alreadyProcessed: true,
      });
    }

    /*
     * Verify Razorpay signature.
     */
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    /*
     * Fetch the Razorpay order from Razorpay itself.
     * This prevents the client from changing the payment amount.
     */
    const order = await razorpay.orders.fetch(razorpay_order_id);

    const expectedAmount = language.price * 100;

    if (Number(order.amount) !== expectedAmount) {
      return NextResponse.json(
        { error: 'Payment amount does not match the selected course' },
        { status: 400 }
      );
    }

    /*
     * Fetch payment details from Razorpay.
     */
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (payment.order_id !== razorpay_order_id) {
      return NextResponse.json(
        { error: 'Payment does not belong to this order' },
        { status: 400 }
      );
    }

    if (payment.status !== 'captured') {
      return NextResponse.json(
        {
          error: `Payment has not been captured yet. Current status: ${payment.status}`,
        },
        { status: 400 }
      );
    }

    /*
     * Create subscription.
     */
    const { data: subscription, error: subscriptionError } =
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan: `${language.name} Course`,
          status: 'active',
          expires_at: null,
        })
        .select('id')
        .single();

    if (subscriptionError || !subscription) {
      console.error(
        'Subscription creation error:',
        subscriptionError
      );

      return NextResponse.json(
        { error: 'Payment verified, but subscription creation failed' },
        { status: 500 }
      );
    }

    /*
     * Connect the subscription to the purchased language.
     */
    const { error: languageError } = await supabaseAdmin
      .from('subscription_languages')
      .insert({
        subscription_id: subscription.id,
        language_id: languageId,
      });

    if (languageError) {
      console.error(
        'Subscription language error:',
        languageError
      );

      return NextResponse.json(
        {
          error:
            'Payment verified, but language access could not be created',
        },
        { status: 500 }
      );
    }

    /*
     * Save payment record.
     */
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        subscription_id: subscription.id,
        razorpay_order_id,
        razorpay_payment_id,
        amount: Number(order.amount),
        currency: order.currency,
        status: 'paid',
      });

    if (paymentError) {
      console.error(
        'Payment record error:',
        paymentError
      );

      return NextResponse.json(
        {
          error:
            'Payment verified, but payment record could not be saved',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${language.name} course unlocked successfully!`,
      language: language.name,
    });
  } catch (error) {
    console.error('Payment verification error:', error);

    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}