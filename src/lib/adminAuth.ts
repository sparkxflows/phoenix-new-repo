import { supabase, USE_REMOTE_SUPABASE } from './supabase';

const ADMIN_STORAGE_KEY = 'phoenix_admin_account_v1';
const SESSION_STORAGE_KEY = 'phoenix_admin_session_v1';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface AdminSession {
  token: string;
  email: string;
  full_name: string;
  loggedInAt: string;
}

// SHA-256 helper with salt for password security fallback
async function hashPassword(password: string): Promise<string> {
  const salt = 'phoenix_tattooz_secure_2019_hisar';
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks whether admin access is active.
 * Registration from the UI is removed; admins are added directly in Supabase Authentication.
 * Always returns claimed: true so the clean sign-in screen is shown.
 */
export async function checkAdminSlotClaimed(): Promise<{ claimed: boolean; adminInfo?: Partial<AdminUser> }> {
  // Always true - no public self-registration. Access is managed via Supabase Authentication.
  return {
    claimed: true,
    adminInfo: {
      email: 'phoenixtattoozhisar@gmail.com',
      full_name: 'Rohit Sharma (Master Administrator)',
      role: 'super_admin',
    },
  };
}

/**
 * Authenticates the admin user.
 * 1. Primary: Direct Supabase Authentication (supabase.auth.signInWithPassword)
 * 2. Secondary: Supabase admin_users table check
 * 3. Tertiary: Local / Express server fallback
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. PRIMARY: Authenticate directly against Supabase Auth (managed in Supabase Dashboard).
  // The local clone skips this call so it can go straight to its Express fallback.
  if (USE_REMOTE_SUPABASE) {
    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (!authErr && authData?.session) {
        const userMeta = authData.user?.user_metadata || {};
        const fullName = userMeta.full_name || userMeta.name || 'Studio Administrator';
        const session: AdminSession = {
          token: authData.session.access_token || `sb_session_${Date.now()}`,
          email: authData.user?.email || cleanEmail,
          full_name: fullName,
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        return { success: true, session };
      }
    } catch (sbErr) {
      console.warn('Supabase auth attempt error:', sbErr);
    }
  }

  // 2. SECONDARY: Check custom Supabase admin_users table (if user added credentials there)
  try {
    const hashedPassword = await hashPassword(password);
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', cleanEmail)
      .limit(1);

    if (!error && data && data.length > 0) {
      const dbAdmin = data[0];
      if (dbAdmin.password_hash === hashedPassword || dbAdmin.password === password) {
        const session: AdminSession = {
          token: 'session_' + Math.random().toString(36).substring(2, 15),
          email: dbAdmin.email,
          full_name: dbAdmin.full_name || 'Studio Administrator',
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(dbAdmin));
        return { success: true, session };
      }
      return { success: false, error: 'Incorrect password for administrator.' };
    }
  } catch (err) {
    // Proceed to server / local check
  }

  // 3. TERTIARY: Try local Express server login if running
  try {
    const srvRes = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
    });
    if (srvRes.ok) {
      const srvData = await srvRes.json();
      if (srvData.success && srvData.session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(srvData.session));
        return { success: true, session: srvData.session };
      }
    }
  } catch (err) {
    // fallback
  }

  // 4. Studio master fallback check
  const hashedPassword = await hashPassword(password);
  const local = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed.email === cleanEmail && (parsed.password_hash === hashedPassword || parsed.password === password)) {
        const session: AdminSession = {
          token: 'session_' + Math.random().toString(36).substring(2, 15),
          email: parsed.email,
          full_name: parsed.full_name || 'Studio Administrator',
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        return { success: true, session };
      }
      if (parsed.email === cleanEmail) {
        return { success: false, error: 'Incorrect password.' };
      }
    } catch {}
  }

  return {
    success: false,
    error: 'Invalid admin credentials. Please ensure this user has been created in your Supabase Authentication dashboard.',
  };
}

/**
 * Returns current logged-in admin session or null.
 */
export function getCurrentAdminSession(): AdminSession | null {
  const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
}

/**
 * Logs out the admin user from both local storage and Supabase Auth.
 */
export async function logoutAdmin(): Promise<void> {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  try {
    await supabase.auth.signOut();
  } catch {}
}

/**
 * Updates an appointment status in Supabase.
 */
export async function updateAppointmentStatusInSupabase(
  bookingCodeOrId: string,
  newStatus: string,
  updatedNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: any = { status: newStatus };
    if (updatedNotes !== undefined) {
      updatePayload.notes = updatedNotes;
    }

    let { error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('booking_code', bookingCodeOrId);

    if (error) {
      const byId = await supabase
        .from('appointments')
        .update(updatePayload)
        .eq('id', bookingCodeOrId);
      error = byId.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Update failed' };
  }
}

/**
 * Deletes an appointment record from Supabase.
 */
export async function deleteAppointmentFromSupabase(
  bookingCodeOrId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let { error } = await supabase
      .from('appointments')
      .delete()
      .eq('booking_code', bookingCodeOrId);

    if (error) {
      const byId = await supabase
        .from('appointments')
        .delete()
        .eq('id', bookingCodeOrId);
      error = byId.error;
    }

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}

/**
 * Fetches contact inquiries from Supabase.
 */
export async function getContactInquiriesFromSupabase(): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * SQL Schema Reference for Supabase
 */
export const ADMIN_SETUP_SQL = `-- Supabase Authentication & Site Content Setup
-- Note: Admin users can be added directly via the Supabase Dashboard -> Authentication -> Users.

-- Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  booking_code TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service TEXT NOT NULL,
  artist TEXT,
  placement TEXT,
  size TEXT,
  appointment_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon access for studio operation
CREATE POLICY "Allow public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public upsert site_settings" ON public.site_settings FOR ALL USING (true);
CREATE POLICY "Allow public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public update appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Allow public insert inquiries" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read inquiries" ON public.contact_inquiries FOR SELECT USING (true);
`;
