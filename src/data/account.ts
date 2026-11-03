import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { z } from 'zod';

import type { Tables, TablesUpdate } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

// Account reads and writes. Users can change only their own settings (column grants on profiles);
// role and budget stay server-side. Deleting the account goes through the delete-account function.

export const accountKeys = {
  profile: ['account', 'profile'] as const,
  plan: ['account', 'plan'] as const,
  invites: ['account', 'invites'] as const,
};

export type Profile = Pick<
  Tables<'profiles'>,
  'id' | 'display_name' | 'role' | 'ai_enabled' | 'default_check' | 'explain_lang'
>;

export function useProfile(): UseQueryResult<Profile> {
  return useQuery({
    queryKey: accountKeys.profile,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, role, ai_enabled, default_check, explain_lang')
        .single();
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export type ProfileSettings = Pick<
  TablesUpdate<'profiles'>,
  'ai_enabled' | 'default_check' | 'explain_lang'
>;

export async function updateProfile(id: string, settings: ProfileSettings): Promise<void> {
  const { error } = await supabase.from('profiles').update(settings).eq('id', id);
  if (error) {
    throw error;
  }
}

export type ExamPlan = Pick<
  Tables<'exam_plans'>,
  'id' | 'module' | 'target_band' | 'final_mock_date'
>;

/** The latest exam plan, or null before the first one is saved. */
export function useExamPlan(): UseQueryResult<ExamPlan | null> {
  return useQuery({
    queryKey: accountKeys.plan,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_plans')
        .select('id, module, target_band, final_mock_date')
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) {
        throw error;
      }
      return data[0] ?? null;
    },
  });
}

export type ExamPlanChange = Partial<Pick<ExamPlan, 'module' | 'target_band' | 'final_mock_date'>>;

/** An id for a plan that does not exist yet; saveExamPlan creates the row on first save. */
export function newExamPlanId(): string {
  return Crypto.randomUUID();
}

/**
 * Upserts only the changed columns, so two quick changes made before the plan exists create one
 * row (the second one updates it) and never overwrite each other's columns.
 */
export async function saveExamPlan(id: string, change: ExamPlanChange): Promise<void> {
  const { error } = await supabase.from('exam_plans').upsert({ id, ...change });
  if (error) {
    throw error;
  }
}

export type Invite = Pick<Tables<'allowed_emails'>, 'email' | 'invited_at'>;

/** The invite list; only admins can read it (RLS). */
export function useInvites(enabled: boolean): UseQueryResult<Invite[]> {
  return useQuery({
    queryKey: accountKeys.invites,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('email, invited_at')
        .order('invited_at', { ascending: false });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

const inviteEmailSchema = z.email();

/** Lowercased and trimmed, as the invite hook compares them; throws a readable error. */
export function normalizeInviteEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!inviteEmailSchema.safeParse(email).success) {
    throw new Error('Enter a valid email address.');
  }
  return email;
}

export async function addInvite(email: string): Promise<void> {
  const { error } = await supabase.from('allowed_emails').insert({ email });
  if (error) {
    throw error.code === '23505' ? new Error('That email is already invited.') : error;
  }
}

export async function removeInvite(email: string): Promise<void> {
  const { error } = await supabase.from('allowed_emails').delete().eq('email', email);
  if (error) {
    throw error;
  }
}

/** Deletes the account on the server, then clears the local session. */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.functions.invoke('delete-account', {
    body: { confirm: 'delete my account' },
  });
  if (error) {
    throw error;
  }
  // The user no longer exists, so only the local session can be cleared.
  await supabase.auth.signOut({ scope: 'local' });
}
