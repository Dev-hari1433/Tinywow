import { aiStatus } from '@/lib/ai/router';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Reports the live fallback chain: which models are ready and which are cooling down. */
export async function GET() {
  return Response.json(aiStatus(), { headers: { 'Cache-Control': 'no-store' } });
}
