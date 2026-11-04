// Deletes the caller's account (docs/plan.md "Hapus akun"): their audio files in Storage, then the
// Auth user. Every table row goes with the user through `on delete cascade`.
import { withSupabase } from '@supabase/server';
import { z } from 'zod';

/** Private bucket for recordings; objects live under `<user id>/`. */
const AUDIO_BUCKET = 'audio';
const PAGE_SIZE = 100;

const bodySchema = z.object({ confirm: z.literal('delete my account') });

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Use POST.' }, { status: 405 });
    }
    const body = bodySchema.safeParse(await req.json().catch(() => null));
    if (!body.success) {
      return Response.json(
        { error: 'Send {"confirm": "delete my account"} to delete your account.' },
        { status: 400 },
      );
    }
    const userId = ctx.userClaims?.id;
    if (!userId) {
      return Response.json({ error: 'Not signed in.' }, { status: 401 });
    }
    const storage = ctx.supabaseAdmin.storage;

    /** Removes everything under `<userId>/` in the audio bucket; returns how many files went. */
    async function removeAudio(): Promise<number> {
      const buckets = await storage.listBuckets();
      if (buckets.error) {
        throw buckets.error;
      }
      if (!buckets.data.some((bucket) => bucket.name === AUDIO_BUCKET)) {
        return 0;
      }
      let removed = 0;
      for (;;) {
        const page = await storage.from(AUDIO_BUCKET).list(userId, { limit: PAGE_SIZE });
        if (page.error) {
          throw page.error;
        }
        const paths = page.data.map((file) => `${userId}/${file.name}`);
        if (paths.length === 0) {
          return removed;
        }
        const result = await storage.from(AUDIO_BUCKET).remove(paths);
        if (result.error) {
          throw result.error;
        }
        removed += paths.length;
      }
    }

    try {
      // Files first: rows cascade with the user, Storage objects do not.
      const filesRemoved = await removeAudio();
      const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) {
        throw error;
      }
      console.log(JSON.stringify({ event: 'account_deleted', filesRemoved }));
      return Response.json({ deleted: true, filesRemoved });
    } catch (error) {
      console.error(JSON.stringify({ event: 'account_delete_failed', message: String(error) }));
      return Response.json({ error: 'Could not delete the account. Try again.' }, { status: 500 });
    }
  }),
};
