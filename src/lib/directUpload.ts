/**
 * Direct-to-Supabase-Storage upload.
 *
 * Vercel serverless functions reject request bodies above ~4.5 MB, so large
 * hero videos could never reach /api/upload-video in production. This helper:
 *
 *   1. asks /api/upload-sign for a short-lived signed upload URL
 *   2. PUTs the file straight into the `studio-uploads` bucket
 *   3. returns the permanent public URL
 *
 * Returns `null` whenever the direct route is unavailable (local Express dev,
 * missing buckets, CORS), so every caller can fall back to the classic
 * /api/upload-* endpoints.
 */

interface SignResponse {
  success?: boolean;
  uploadUrl?: string;
  publicUrl?: string;
}

export async function uploadFileDirect(
  file: File,
  options: { folder?: 'images' | 'videos'; type?: string } = {}
): Promise<string | null> {
  try {
    const signRes = await fetch('/api/upload-sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        folder: options.folder,
        type: options.type,
      }),
    });

    if (!signRes.ok) return null;

    const sign = (await signRes.json()) as SignResponse;
    if (!sign.success || !sign.uploadUrl || !sign.publicUrl) return null;

    const putRes = await fetch(sign.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: file,
    });

    if (!putRes.ok) {
      console.warn('[upload] direct storage PUT failed:', putRes.status, await putRes.text().catch(() => ''));
      return null;
    }

    return sign.publicUrl;
  } catch (err) {
    console.warn('[upload] direct storage upload unavailable, falling back:', err);
    return null;
  }
}

/** True for files that would exceed Vercel's ~4.5 MB function body limit. */
export function exceedsServerlessBodyLimit(file: File): boolean {
  return file.size > 4 * 1024 * 1024;
}
