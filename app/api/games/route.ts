import { NextRequest, NextResponse } from 'next/server';
import { getGames, createGame } from '@/lib/games/games-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'upcoming' | 'completed' | null;

    const games = await getGames(status || undefined);

    return NextResponse.json({ games, count: games.length }, { status: 200 });
  } catch (err: any) {
    console.error('[API /api/games GET] error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch games', message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      timezone,
      visibility,
      password,
      startingCapital,
      maxPlayers,
      allowedAssetClasses,
      duration,
      allowLateJoiners,
      allowJoinAfterStart,
      creatorId,
      creatorName,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Game name is required' }, { status: 400 });
    }

    const newGame = await createGame(
      {
        name,
        description: description || '',
        startDate: startDate || new Date().toISOString(),
        startTime: startTime || '09:00 AM EDT',
        endDate: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: endTime || '06:00 PM EDT',
        timezone: timezone || 'US Eastern Time (EDT/EST)',
        visibility: visibility || 'public',
        password,
        startingCapital: Number(startingCapital) || 25000,
        maxPlayers: Number(maxPlayers) || 0,
        allowedAssetClasses: allowedAssetClasses || ['stocks', 'etfs', 'indices'],
        duration: duration || '14 days',
        allowLateJoiners: Boolean(allowLateJoiners ?? allowJoinAfterStart ?? true),
        allowJoinAfterStart: Boolean(allowLateJoiners ?? allowJoinAfterStart ?? true),
      },
      creatorId,
      creatorName
    );

    return NextResponse.json({ success: true, game: newGame }, { status: 201 });
  } catch (err: any) {
    console.error('[API /api/games POST] error:', err.message);
    return NextResponse.json({ error: 'Failed to create game', message: err.message }, { status: 500 });
  }
}
