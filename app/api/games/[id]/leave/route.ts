import { NextRequest, NextResponse } from 'next/server';
import { leaveGame } from '@/lib/games/games-service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required to leave' }, { status: 400 });
    }

    const result = await leaveGame({
      gameIdOrSlug: gameId,
      userId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error(`[API /api/games/${params.id}/leave POST] error:`, err.message);
    return NextResponse.json({ error: 'Leave failed', message: err.message }, { status: 400 });
  }
}
