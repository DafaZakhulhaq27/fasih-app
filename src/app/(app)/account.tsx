import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState, type ReactElement, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session-provider';
import { BandChips } from '@/components/band-chips';
import { Button } from '@/components/button';
import { FadeUp } from '@/components/motion';
import { ScreenHeader } from '@/components/screen-header';
import { Segmented } from '@/components/segmented';
import { TextField } from '@/components/text-field';
import {
  accountKeys,
  addInvite,
  deleteAccount,
  type ExamPlan,
  type ExamPlanChange,
  newExamPlanId,
  normalizeInviteEmail,
  type Profile,
  type ProfileSettings,
  removeInvite,
  saveExamPlan,
  updateProfile,
  useExamPlan,
  useInvites,
  useProfile,
} from '@/data/account';
import { DEFAULT_TARGET_BAND, progressKeys } from '@/data/progress';
import { supabase } from '@/lib/supabase';
import { borderWidth, colors, fonts, gutter, radius, textStyles, touchTarget } from '@/theme';

// react-native-web paints the "on" thumb with activeThumbColor (teal by default) and ignores
// thumbColor there; the prop is not in React Native's Switch types, so it is spread in.
const webSwitchThumb = { activeThumbColor: colors.surface };

type Module = 'academic' | 'general_training' | 'none';

// Six chips fit one row inside a card on a 375pt-wide phone.
const targetBands = [5.5, 6, 6.5, 7, 7.5, 8] as const;

/** True for a real YYYY-MM-DD date (rejects 2027-02-30). */
function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** The values `state` had for the keys in `change`, to undo only that change if it fails. */
function pickKeys<T extends object>(state: T, change: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.keys(change).map((key) => [key, state[key as keyof T]]),
  ) as Partial<T>;
}

function toModule(value: string | null | undefined): Module {
  return value === 'academic' || value === 'general_training' ? value : 'none';
}

// docs/design/screens/13-account.png
export default function AccountScreen(): ReactElement {
  const router = useRouter();
  const profile = useProfile();
  const plan = useExamPlan();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <ScreenHeader title="Account" onBack={() => router.back()} />
          {profile.isPending || plan.isPending ? <Text style={styles.muted}>Loading…</Text> : null}
          {profile.isError || plan.isError ? (
            <Text accessibilityRole="alert" style={styles.muted}>
              Could not load your account: {(profile.error ?? plan.error)?.message}
            </Text>
          ) : null}
          {profile.data && plan.isSuccess ? (
            <AccountBody profile={profile.data} plan={plan.data} />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AccountBody({ profile, plan }: { profile: Profile; plan: ExamPlan | null }): ReactElement {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const [settings, setSettings] = useState({
    ai_enabled: profile.ai_enabled,
    default_check: profile.default_check,
    explain_lang: profile.explain_lang,
  });
  const [planId] = useState(() => plan?.id ?? newExamPlanId());
  const [planState, setPlanState] = useState<ExamPlanChange>({
    module: plan?.module ?? null,
    target_band: plan?.target_band ?? null,
    final_mock_date: plan?.final_mock_date ?? null,
  });
  const [mockDate, setMockDate] = useState(plan?.final_mock_date ?? '');
  const [error, setError] = useState<string | null>(null);

  const email = session?.user.email ?? '';
  const name = profile.display_name ?? email;
  const provider = session?.user.app_metadata.provider === 'google' ? 'Google' : 'email';

  async function changeSettings(change: ProfileSettings): Promise<void> {
    const previous = pickKeys(settings, change);
    setSettings((current) => ({ ...current, ...change }));
    setError(null);
    try {
      await updateProfile(profile.id, change);
      await queryClient.invalidateQueries({ queryKey: accountKeys.profile });
    } catch (e) {
      setSettings((current) => ({ ...current, ...previous }));
      setError(`Not saved: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  }

  async function changePlan(change: ExamPlanChange): Promise<void> {
    const previous = pickKeys(planState, change);
    setPlanState((current) => ({ ...current, ...change }));
    setError(null);
    try {
      await saveExamPlan(planId, change);
      await queryClient.invalidateQueries({ queryKey: accountKeys.plan });
      await queryClient.invalidateQueries({ queryKey: progressKeys.target });
    } catch (e) {
      setPlanState((current) => ({ ...current, ...previous }));
      setError(`Not saved: ${e instanceof Error ? e.message : 'unknown error'}`);
    }
  }

  function saveMockDate(): void {
    const value = mockDate.trim();
    if (value === (planState.final_mock_date ?? '')) {
      return;
    }
    if (value !== '' && !isCalendarDate(value)) {
      setError('Write the final mock date as YYYY-MM-DD, for example 2027-04-03.');
      return;
    }
    changePlan({ final_mock_date: value === '' ? null : value }).catch(() => undefined);
  }

  return (
    <>
      <View style={styles.identity}>
        <View aria-hidden style={styles.avatar}>
          <Text style={styles.avatarText}>{(name[0] ?? '?').toUpperCase()}</Text>
        </View>
        <View style={styles.identityText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.muted}>
            Signed in with {provider}
            {profile.role === 'admin' ? ' · Admin' : ''}
          </Text>
        </View>
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Section title="IELTS PLAN">
        <Row title="Module" hint="Choose at the week 4 checkpoint.">
          <Segmented<Module>
            label="Module"
            options={[
              { value: 'academic', label: 'Academic' },
              { value: 'general_training', label: 'General Training' },
              { value: 'none', label: 'Not chosen' },
            ]}
            value={toModule(planState.module)}
            onChange={(value) =>
              changePlan({ module: value === 'none' ? null : value }).catch(() => undefined)
            }
          />
        </Row>
        <Row title="Target band" hint="Set it from your destination later.">
          <BandChips
            label="Target band"
            options={targetBands}
            value={planState.target_band ?? DEFAULT_TARGET_BAND}
            onChange={(band) => changePlan({ target_band: band }).catch(() => undefined)}
          />
        </Row>
        <Row title="Final mock">
          <TextField
            label="Date (YYYY-MM-DD)"
            value={mockDate}
            onChangeText={setMockDate}
            onBlur={saveMockDate}
            onSubmitEditing={saveMockDate}
            placeholder="Not set"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
          />
        </Row>
        <Row title="Learning language" last>
          <Text style={styles.value}>English</Text>
        </Row>
      </Section>

      <Section title="CHECKING ANSWERS" index={1}>
        <Row title="Default check" hint="You can switch on every result.">
          <Segmented
            label="Default check"
            options={[
              { value: 'manual', label: 'Self-check' },
              { value: 'ai', label: 'AI feedback' },
            ]}
            value={settings.default_check}
            onChange={(value) => changeSettings({ default_check: value }).catch(() => undefined)}
          />
        </Row>
        <Row
          title="Send my answers to AI"
          hint="Off means self-check only. Lessons, review and mocks work the same. AI checks are not connected yet."
          trailing={
            <Switch
              accessibilityLabel="Send my answers to AI"
              value={settings.ai_enabled}
              onValueChange={(value) =>
                changeSettings({ ai_enabled: value }).catch(() => undefined)
              }
              trackColor={{ false: colors.border, true: colors.pencil }}
              thumbColor={colors.surface}
              {...webSwitchThumb}
            />
          }
        />
        <Row title="Explanations" hint="Corrections stay in English." last>
          <Segmented
            label="Explanation language"
            options={[
              { value: 'en', label: 'English' },
              { value: 'id', label: 'Indonesian' },
            ]}
            value={settings.explain_lang === 'id' ? 'id' : 'en'}
            onChange={(value) => changeSettings({ explain_lang: value }).catch(() => undefined)}
          />
        </Row>
      </Section>

      <Section title="SYNC" index={2}>
        <Text style={styles.body}>
          Changes save straight to your account when you are online. Saving while offline comes
          later.
        </Text>
      </Section>

      {profile.role === 'admin' ? <Invites /> : null}

      <Section title="PRIVACY AND DATA" index={3}>
        <Text style={styles.body}>
          • When AI checks are on, answers go to Google&apos;s Gemini for feedback. On the free tier
          they may be used to improve its models.
        </Text>
        <Text style={styles.body}>
          • Recordings are deleted after 30 days. Transcripts and feedback stay.
        </Text>
      </Section>

      <SignOutAndDelete />
    </>
  );
}

function Invites(): ReactElement {
  const queryClient = useQueryClient();
  const invites = useInvites(true);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: accountKeys.invites });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="ADMIN" index={3}>
      <Text style={styles.rowTitle}>Invites{invites.data ? ` (${invites.data.length})` : ''}</Text>
      <Text style={styles.muted}>
        Only these emails can sign up. Invite friends in self-check mode until AI is on a paid tier.
      </Text>
      {invites.data?.map((invite) => (
        <View key={invite.email} style={styles.inviteRow}>
          <Text style={styles.inviteEmail}>{invite.email}</Text>
          <Button
            variant="secondary"
            label="Remove"
            accessibilityLabel={`Remove ${invite.email}`}
            disabled={busy}
            onPress={() => run(() => removeInvite(invite.email))}
          />
        </View>
      ))}
      <TextField
        label="Invite an email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="name@example.com"
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Button
        variant="secondary"
        label="Add invite"
        busy={busy}
        onPress={() =>
          run(async () => {
            await addInvite(normalizeInviteEmail(email));
            setEmail('');
          })
        }
      />
    </Section>
  );
}

function SignOutAndDelete(): ReactElement {
  const [signingOut, setSigningOut] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut(): Promise<void> {
    setSigningOut(true);
    setError(null);
    // The session provider sees SIGNED_OUT and the route guard returns to sign-in.
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(`Could not sign out: ${signOutError.message}`);
      setSigningOut(false);
    }
  }

  async function remove(): Promise<void> {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (e) {
      setError(`Not deleted: ${e instanceof Error ? e.message : 'unknown error'}. Try again.`);
      setDeleting(false);
    }
  }

  return (
    <View style={styles.footer}>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Button variant="secondary" label="Sign out" busy={signingOut} onPress={signOut} />
      {confirming ? (
        <View style={styles.confirm}>
          <Text style={styles.body}>
            This deletes your account, progress, mistakes, review cards and recordings. It cannot be
            undone. Type delete to confirm.
          </Text>
          <TextField
            label="Type delete"
            value={typed}
            onChangeText={setTyped}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            variant="danger"
            label="Delete my account"
            busy={deleting}
            disabled={typed.trim().toLowerCase() !== 'delete'}
            onPress={remove}
          />
          <Button
            variant="secondary"
            label="Keep my account"
            onPress={() => setConfirming(false)}
          />
        </View>
      ) : (
        <Button variant="danger" label="Delete account" onPress={() => setConfirming(true)} />
      )}
      <Text style={styles.footnote}>
        Deletes your account, progress and recordings. This can&apos;t be undone.
      </Text>
    </View>
  );
}

function Section({
  title,
  index = 0,
  children,
}: {
  title: string;
  /** Order on the screen, for the arrival stagger. */
  index?: number;
  children: ReactNode;
}): ReactElement {
  return (
    <FadeUp index={index} style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </FadeUp>
  );
}

function Row({
  title,
  hint,
  trailing,
  last = false,
  children,
}: {
  title: string;
  hint?: string;
  trailing?: ReactNode;
  last?: boolean;
  children?: ReactNode;
}): ReactElement {
  return (
    <View style={[styles.row, !last && styles.rowRule]}>
      <View style={styles.rowHead}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          {hint ? <Text style={styles.muted}>{hint}</Text> : null}
        </View>
        {trailing}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    paddingHorizontal: gutter.compact,
    paddingVertical: 16,
  },
  column: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 16,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: borderWidth.control,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...textStyles.section,
    color: colors.ink,
  },
  identityText: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...textStyles.cardTitle,
    color: colors.ink,
  },
  section: {
    gap: 10,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.hairline,
    borderColor: colors.rule,
    borderRadius: radius.card,
  },
  sectionTitle: {
    ...textStyles.captionSmall,
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
    color: colors.ink2,
  },
  row: {
    gap: 10,
    paddingVertical: 8,
  },
  rowRule: {
    paddingBottom: 14,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.rule,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: touchTarget,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...textStyles.body,
    color: colors.ink,
  },
  value: {
    ...textStyles.bodyStrong,
    color: colors.ink,
  },
  body: {
    ...textStyles.bodySmall,
    color: colors.ink,
  },
  muted: {
    ...textStyles.caption,
    color: colors.ink2,
  },
  error: {
    ...textStyles.bodySmall,
    color: colors.ink,
    backgroundColor: colors.wash,
    borderRadius: radius.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteEmail: {
    ...textStyles.bodySmall,
    flex: 1,
    color: colors.ink,
  },
  footer: {
    gap: 12,
    paddingBottom: 24,
  },
  confirm: {
    gap: 10,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: borderWidth.control,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  footnote: {
    ...textStyles.caption,
    color: colors.ink2,
    textAlign: 'center',
  },
});
