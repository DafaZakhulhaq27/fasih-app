// Integration test for the Edge Functions against a local stack (`npx supabase start`).
// Usage: npm run test:functions (reads the local keys from `supabase status`).
// Uses the local secret key, which only exists on this machine or the CI runner.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

import { createClient } from '@supabase/supabase-js';

function localEnv() {
  const out = execFileSync('npx', ['supabase', 'status', '-o', 'env'], { encoding: 'utf8' });
  const env = Object.fromEntries(
    out
      .split('\n')
      .map((line) => line.match(/^([A-Z_]+)="?([^"]*)"?$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2]]),
  );
  for (const key of ['API_URL', 'PUBLISHABLE_KEY', 'SECRET_KEY']) {
    assert.ok(env[key], `supabase status did not print ${key}; is the local stack running?`);
  }
  return env;
}

const env = localEnv();
const admin = createClient(env.API_URL, env.SECRET_KEY, { auth: { persistSession: false } });
const email = `delete-test-${Date.now()}@example.test`;
const password = 'local-only-delete-test-1';

async function check(name, run) {
  await run();
  console.log(`ok - ${name}`);
}

async function callDelete(token, body, method = 'POST') {
  const response = await fetch(`${env.API_URL}/functions/v1/delete-account`, {
    method,
    headers: {
      apikey: env.PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, json: await response.json().catch(() => null) };
}

// A fresh, invited user with a row, a review history source and one audio file.
await admin.from('allowed_emails').insert({ email });
const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
assert.ifError(created.error);
const userId = created.data.user.id;
const user = createClient(env.API_URL, env.PUBLISHABLE_KEY, { auth: { persistSession: false } });
const signIn = await user.auth.signInWithPassword({ email, password });
assert.ifError(signIn.error);
const token = signIn.data.session.access_token;

assert.ifError((await user.from('exam_plans').insert({ target_band: 7 })).error);
const bucket = await admin.storage.createBucket('audio', { public: false });
assert.ok(!bucket.error || /already exists/i.test(bucket.error.message), bucket.error?.message);
assert.ifError(
  (await admin.storage.from('audio').upload(`${userId}/answer.m4a`, new Blob(['fake audio'])))
    .error,
);

await check('rejects a call without a session', async () => {
  assert.equal((await callDelete(null, { confirm: 'delete my account' })).status, 401);
});

await check('rejects a missing confirmation', async () => {
  const result = await callDelete(token, { confirm: 'yes' });
  assert.equal(result.status, 400);
  assert.ok((await admin.auth.admin.getUserById(userId)).data.user, 'user must still exist');
});

await check('rejects other methods', async () => {
  assert.equal((await callDelete(token, null, 'GET')).status, 405);
});

await check('deletes the user, their rows and their audio', async () => {
  const result = await callDelete(token, { confirm: 'delete my account' });
  assert.equal(result.status, 200, JSON.stringify(result.json));
  assert.deepEqual(result.json, { deleted: true, filesRemoved: 1 });
  assert.equal((await admin.auth.admin.getUserById(userId)).data.user, null);
  const plans = await admin.from('exam_plans').select('id').eq('user_id', userId);
  assert.deepEqual(plans.data, []);
  const files = await admin.storage.from('audio').list(userId);
  assert.deepEqual(files.data, []);
});

await admin.from('allowed_emails').delete().eq('email', email);
console.log('All Edge Function checks passed.');
