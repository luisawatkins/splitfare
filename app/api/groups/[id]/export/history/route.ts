import { withAuth, createResponse, createErrorResponse, AuthenticatedRequest } from '@/lib/api-utils';
import { ExporterService } from '@/services/exporter';
import { createServerStorachaService } from '@/lib/storacha-server';

export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const userId = req.user.id;
    const storacha = await createServerStorachaService();
    const exporter = new ExporterService(storacha);

    const history = await exporter.getExportHistory(userId);
    return createResponse(history);
  } catch (error) {
    return createErrorResponse(error);
  }
});
