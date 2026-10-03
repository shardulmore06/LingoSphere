'use client';

import { useState } from 'react';
import Script from 'next/script';
import { supabase } from '@/lib/supabase-client';

const plans = [
  {
    name: 'German',
    languageId: '67e175c1-9f62-4e97-ac53-09c4e5b7e840',
    price: 499,
    description:
      'Learn German vocabulary, grammar and practical communication.',
  },
  {
    name: 'English',
    languageId: '6ce6d62a-1913-42d3-a42f-e1b10bee38e9',
    price: 499,
    description:
      'Learn English vocabulary, grammar and everyday communication.',
  },
  {
    name: 'Spanish',
    languageId: 'ed73cfb8-154a-4ec3-a0c0-4c887cab8f5f',
    price: 499,
    description:
      'Learn Spanish vocabulary, grammar and everyday conversation.',
  },
  {
    name: 'French',
    languageId: '73d754b8-c884-473e-b9aa-b1527efc603e',
    price: 499,
    description:
      'Learn French vocabulary, grammar and useful phrases.',
  },
  {
    name: 'Italian',
    languageId: 'b504ec8a-f464-4e7d-a746-94ed0c7d8221',
    price: 499,
    description:
      'Learn Italian vocabulary, grammar and everyday expressions.',
  },
  {
    name: 'Japanese',
    languageId: '29da528c-04f9-40b0-96ac-4a6315b7c137',
    price: 499,
    description:
      'Learn Japanese vocabulary, grammar and useful expressions.',
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePayment = async (
    languageName: string,
    languageId: string,
    price: number
  ) => {
    try {
      setLoading(languageId);

      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      if (!window.Razorpay) {
        alert('Razorpay Checkout is still loading. Please try again.');
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'LingoSphere',
        description: `${languageName} Language Course`,
        order_id: data.orderId,

        handler: async function (paymentResponse: any) {
          try {
            console.log('Payment successful:', paymentResponse);

            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
              alert(
                'Payment was completed, but your session could not be verified. Please sign in again.'
              );
              return;
            }

            const verifyResponse = await fetch(
              '/api/payments/verify',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,
                  razorpay_signature:
                    paymentResponse.razorpay_signature,
                  languageId,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.error || 'Payment verification failed'
              );
            }

            alert(
              `Payment successful! 🎉\n\n${languageName} is now unlocked.`
            );
          } catch (error) {
            console.error(
              'Payment verification error:',
              error
            );

            alert(
              'Payment was completed, but we could not unlock the course automatically. Please contact the administrator.'
            );
          } finally {
            setLoading(null);
          }
        },

        prefill: {
          name: 'LingoSphere Student',
        },

        theme: {
          color: '#4f46e5',
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        'payment.failed',
        function (response: any) {
          console.error(
            'Payment failed:',
            response.error
          );

          alert(
            `Payment failed.\n\n${
              response.error.description ||
              'Please try again.'
            }`
          );

          setLoading(null);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(error);

      alert(
        'Something went wrong while creating the payment order.'
      );

      setLoading(null);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-slate-900">
              Choose Your Language
            </h1>

            <p className="mt-3 text-slate-600">
              Purchase a language course and unlock access to its lessons,
              vocabulary, grammar and quizzes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.languageId}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-slate-900">
                  {plan.name}
                </h2>

                <p className="mt-3 min-h-[60px] text-sm leading-6 text-slate-600">
                  {plan.description}
                </p>

                <div className="mt-6">
                  <span className="text-3xl font-bold text-slate-900">
                    ₹{plan.price}
                  </span>

                  <span className="ml-2 text-sm text-slate-500">
                    / course
                  </span>
                </div>

                <button
                  onClick={() =>
                    handlePayment(
                      plan.name,
                      plan.languageId,
                      plan.price
                    )
                  }
                  disabled={loading === plan.languageId}
                  className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading === plan.languageId
                    ? 'Opening payment...'
                    : `Buy ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center text-sm text-yellow-800">
            Razorpay is currently running in Test Mode. No real money will be
            charged.
          </div>
        </div>
      </main>
    </>
  );
}