import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.text();
  const params = new URLSearchParams(body);
  const socketId = params.get('socket_id');
  const channel = params.get('channel_name');

  if (!socketId || !channel) {
    return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
  }

  // Only allow presence channels prefixed with presence- and private channels
  if (!channel.startsWith('presence-') && !channel.startsWith('private-')) {
    return NextResponse.json({ error: 'Forbidden channel type' }, { status: 403 });
  }

  try {
    const userData = {
      user_id: userId,
      user_info: { id: userId },
    };

    const authResponse = pusherServer.authorizeChannel(socketId, channel, userData);
    return NextResponse.json(authResponse);
  } catch (err) {
    console.error('Pusher auth error:', err);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
