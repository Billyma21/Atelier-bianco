'use server';

import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function bootstrapAdmin(requestedEmail?: string, requestedPassword?: string) {
  const email = requestedEmail?.trim();
  const password = requestedPassword;
  if (!email || !password) {
    return { success: false, error: 'Email et mot de passe requis.' };
  }

  const devLog = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') console.log(...args);
  };

  try {
    const supabaseAdmin = getSupabaseAdmin();
    // 1. Try to find the user first
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    let user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      devLog('User not found, creating...');
      // 2. Create user if missing
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Kenzy Admin' }
      });

      if (createError) {
        if (createError.message.includes('already been registered')) {
          const { data: { users: retryUsers } } = await supabaseAdmin.auth.admin.listUsers();
          user = retryUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
        } else {
          throw createError;
        }
      } else {
        if (!newUser) throw new Error('Création admin échouée: utilisateur manquant.');
        user = newUser;
      }
    }

    if (!user) throw new Error('Utilisateur admin introuvable.');

    devLog('User ID:', user.id, 'Updating password and confirmation...');

    // 3. Force confirm, set password AND set role in app_metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true,
        password: password,
        app_metadata: { role: 'admin' }
      }
    );
    if (updateError) throw updateError;

    // 4. Ensure profile exists and has admin role
    devLog('Ensuring profile role is admin...');
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ 
          id: user.id, 
          email: email, 
          role: 'admin',
          full_name: 'Kenzy Admin'
        });
      if (insertError) throw insertError;
    } else {
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);
      if (updateProfileError) throw updateProfileError;
    }

    devLog('Bootstrap completed successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error bootstrapping admin:', error);
    return { success: false, error: error.message };
  }
}
