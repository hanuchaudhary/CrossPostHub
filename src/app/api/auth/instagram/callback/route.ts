// app/api/webhook/instagram/route.ts
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = 'INSTAGRAM_CROSSPOSTHUB';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('🔔 Webhook verified:', { mode, token, challenge });
    return new Response(challenge, { status: 200 });
  } else {
    return new Response('Verification failed', { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('🔔 Webhook received:', body);

  return new Response('Event received', { status: 200 });
}
