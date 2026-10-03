import { supabase } from '@/lib/supabase-client';

export async function hasPaidAccess(languageId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  // Admins can access all course content
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'admin') {
    return true;
  }

  // Find active subscriptions for this user
  const { data: subscriptions, error: subscriptionError } =
    await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active');

  if (
    subscriptionError ||
    !subscriptions ||
    subscriptions.length === 0
  ) {
    return false;
  }

  const subscriptionIds = subscriptions.map(
    (subscription) => subscription.id
  );

  // Check whether the user purchased this language
  const { data: access, error: accessError } =
    await supabase
      .from('subscription_languages')
      .select('id')
      .eq('language_id', languageId)
      .in('subscription_id', subscriptionIds)
      .maybeSingle();

  if (accessError) {
    console.error('Course access error:', accessError);
    return false;
  }

  return !!access;
}