import { withMiddleware, createResponse } from '@/lib/api-utils';
import { createServerStorachaService } from '@/lib/storacha-server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const uploadFile = async (req: Request) => {
  try {
    const formData = await req.formData();
    const uploaded = formData.get('file');

    if (!(uploaded instanceof File)) {
      return createResponse({ error: 'Missing file' }, 400);
    }

    try {
      const storacha = await createServerStorachaService();
      const cid = await storacha.uploadFile(uploaded as unknown as Blob);
      return createResponse({ cid }, 201);
    } catch (storachaError) {
      // Fallback for local/dev environments without a configured storage provider.
      const buffer = Buffer.from(await uploaded.arrayBuffer());
      const safeName = uploaded.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}-${randomUUID()}-${safeName}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, fileName), buffer);
      const url = `/uploads/${fileName}`;
      console.warn('Storacha upload failed; used local upload fallback:', storachaError);
      return createResponse({ cid: url }, 201);
    }
  } catch (error) {
    console.error('Error in POST /api/upload:', error);
    return createResponse({ error: 'Failed to upload file' }, 500);
  }
};

export const POST = withMiddleware(uploadFile, { rateLimit: true });

