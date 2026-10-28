import { useState, useEffect, useCallback } from 'react';

export interface RewardClaim {
  code: string;
  claimedAt: string;
  offerType: 'birthday' | 'referral' | 'welcome';
  discountPercentage?: number;
  memberName?: string;
  memberEmail?: string;
}

export interface MemberUser {
  id: string;
  name: string;
  email: string;
  birthdate?: string | null;
  created_at?: string;
  last_login?: string;
  sign_in_count?: number;
  claims: {
    birthday?: RewardClaim;
    referral?: RewardClaim;
    welcome?: RewardClaim;
    [key: string]: any;
  };
}

const STORAGE_TOKEN_KEY = 'phoenix_member_token_v1';
const STORAGE_USER_KEY = 'phoenix_member_user_v1';
export const MEMBER_AUTH_EVENT = 'phoenix_member_auth_changed';
export const OPEN_AUTH_MODAL_EVENT = 'phoenix_open_auth_modal';

export interface OpenAuthModalDetail {
  mode?: 'signin' | 'signup';
  title?: string;
  subtitle?: string;
  afterTab?: 'birthday' | 'referral';
}

export function triggerAuthModal(detail?: OpenAuthModalDetail): void {
  try {
    window.dispatchEvent(new CustomEvent(OPEN_AUTH_MODAL_EVENT, { detail }));
  } catch (e) {
    console.error('Failed to dispatch auth modal event', e);
  }
}


export function getStoredMemberToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredMemberUser(): MemberUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setStoredMemberSession(token: string, user: MemberUser): void {
  try {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent(MEMBER_AUTH_EVENT, { detail: user }));
  } catch (err) {
    console.warn('Failed to store member session locally:', err);
  }
}

export function clearStoredMemberSession(): void {
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    window.dispatchEvent(new CustomEvent(MEMBER_AUTH_EVENT, { detail: null }));
  } catch {}
}

export async function signUpMember(
  name: string, 
  email: string, 
  password: string, 
  birthdate?: string
): Promise<{
  success: boolean;
  user?: MemberUser;
  token?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, birthdate: birthdate || undefined }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to sign up.' };
    }
    setStoredMemberSession(data.token, data.user);
    return { success: true, user: data.user, token: data.token };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during signup' };
  }
}

export async function signInMember(email: string, password: string): Promise<{
  success: boolean;
  user?: MemberUser;
  token?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Invalid email or password.' };
    }
    setStoredMemberSession(data.token, data.user);
    return { success: true, user: data.user, token: data.token };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during signin' };
  }
}

export async function signOutMember(): Promise<void> {
  const token = getStoredMemberToken();
  if (token) {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {}
  }
  clearStoredMemberSession();
}

export async function fetchCurrentMember(): Promise<MemberUser | null> {
  const token = getStoredMemberToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
        return data.user;
      }
    }
  } catch {}
  return getStoredMemberUser();
}

export async function claimRewardOffer(offerType: 'birthday' | 'referral' | 'welcome'): Promise<{
  success: boolean;
  alreadyClaimed?: boolean;
  claim?: RewardClaim;
  user?: MemberUser;
  error?: string;
  message?: string;
}> {
  const token = getStoredMemberToken();
  if (!token) {
    return {
      success: false,
      error: 'Please sign in or create an account to claim your rewards and gifts.',
    };
  }

  try {
    const res = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ offerType }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to claim reward.' };
    }

    if (data.user) {
      const currentUser = getStoredMemberUser();
      const updatedUser: MemberUser = {
        ...(currentUser || { id: data.user.id, name: data.user.name, email: data.user.email, claims: {} }),
        ...data.user,
      };
      setStoredMemberSession(token, updatedUser);
    }

    return {
      success: true,
      alreadyClaimed: Boolean(data.alreadyClaimed),
      claim: data.claim,
      user: data.user,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error claiming reward' };
  }
}

/**
 * Reactive hook for client authentication state across the application
 */
export function useMemberAuth() {
  const [user, setUser] = useState<MemberUser | null>(getStoredMemberUser);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    const fresh = await fetchCurrentMember();
    setUser(fresh);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();

    const handleAuthEvent = (e: Event) => {
      const custom = e as CustomEvent<MemberUser | null>;
      setUser(custom.detail || null);
    };

    window.addEventListener(MEMBER_AUTH_EVENT, handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    return () => {
      window.removeEventListener(MEMBER_AUTH_EVENT, handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
    };
  }, [refreshUser]);

  return {
    user,
    isAuthenticated: Boolean(user),
    loading,
    signIn: signInMember,
    signUp: signUpMember,
    signOut: signOutMember,
    claimOffer: claimRewardOffer,
    refreshUser,
  };
}

export async function fetchAdminMembers(): Promise<{
  success: boolean;
  members: any[];
  activity_log: any[];
  total_members: number;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/members', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, members: [], activity_log: [], total_members: 0, error: data.error };
    }
    return {
      success: true,
      members: data.members || [],
      activity_log: data.activity_log || [],
      total_members: data.total_members || 0,
    };
  } catch (err: any) {
    return { success: false, members: [], activity_log: [], total_members: 0, error: err?.message };
  }
}

export async function deleteAdminMember(memberId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}
