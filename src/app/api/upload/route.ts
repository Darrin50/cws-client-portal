import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import {
  errorResponse,
  jsonResponse,
  unauthorizedResponse,
} from '@/lib/api-helpers';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) ?? 'brand';

    if (!file) return errorResponse('No file provided', 400);
    if (file.size > MAX_FILE_SIZE) return errorResponse('File exceeds 50 MB limit', 400);

    // Sanitise the original filename for storage
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobPath = `${folder}/${Date.now()}-${safeName}`;

    const blob = await put(blobPath, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return jsonResponse({ url: blob.url, size: file.size, name: file.name });
  } catch (err) {
    console.error('POST /api/upload error:', err);

    // Surface a clearer error when the Blob token is missing / invalid
    if (
      err instanceof Error &&
      (err.message.includes('token') || err.message.includes('BLOB'))
    ) {
      return errorResponse('Storage not configured — add BLOB_READ_WRITE_TOKEN to env', 503);
    }

    return errorResponse('Upload failed', 500);
  }
}
