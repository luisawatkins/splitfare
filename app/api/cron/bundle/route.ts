import { createBundleScheduler } from '@/services/bundle-scheduler';
import { createResponse, createErrorResponse } from '@/lib/api-utils';

export const GET = async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return createErrorResponse(new Error('Unauthorized cron request'));
    }

    const scheduler = await createBundleScheduler();
    await scheduler.runScheduledBundling();

    return createResponse({ message: 'Scheduled bundling pipeline triggered' });
  } catch (error) {
    console.error('[CRON] Bundling pipeline failed:', error);
    return createErrorResponse(error);
  }
};
