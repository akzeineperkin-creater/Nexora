import { NextRequest, NextResponse } from 'next/server';
import { joinGame } from '@/lib/games/games-service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await request.json();
    const { userId, username, password } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required to join' }, { status: 400 });
    }

    const result = await joinGame({
      gameIdOrSlug: gameId,
      userId,
      username,
      password,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error(`[API /api/games/${params.id}/join POST] error:`, err.message);
    return NextResponse.json({ error: 'Join failed', message: err.message }, { status: 400 });
  }
}
