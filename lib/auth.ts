import { supabase } from './supabase';

export async function loginAdmin(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return false;
    }

    // Verificar si el usuario es admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!adminUser) {
      await supabase.auth.signOut();
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error logging in:', err);
    return false;
  }
}

export async function isAdminLoggedIn(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user?.id) return false;

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', data.session.user.id)
      .single();

    return !!adminUser;
  } catch (err) {
    return false;
  }
}

export async function logoutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}
