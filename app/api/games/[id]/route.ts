import { NextRequest, NextResponse } from 'next/server';
import { getGameById, getGamePortfolio, executeGameTrade, sanitizeGame } from '@/lib/games/games-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest-user';
    const username = searchParams.get('username') || undefined;
    const passwordAttempt = searchParams.get('password') || request.headers.get('x-game-password') || undefined;
    const authHeader = request.headers.get('x-game-auth') || searchParams.get('auth') || undefined;

    // Get raw game for authorization verification
    const rawGame = await getGameById(gameId, { raw: true });
    if (!rawGame) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Access control for private games
    if (rawGame.visibility === 'private') {
      const isCreator = Boolean(rawGame.creatorId && userId && rawGame.creatorId === userId);
      const isPasswordCorrect = Boolean(rawGame.password && passwordAttempt && rawGame.password.trim() === passwordAttempt.trim());
      const isTokenAuthorized = Boolean(authHeader === `auth_ok_${rawGame.id}`);

      if (!isCreator && !isPasswordCorrect && !isTokenAuthorized) {
        return NextResponse.json(
          {
            error: 'PRIVATE_GAME_PASSWORD_REQUIRED',
            isPrivate: true,
            isLocked: true,
            game: sanitizeGame(rawGame),
            message: 'This tournament is private. Password verification is required to enter.',
          },
          { status: 403 }
        );
      }
    }

    const { portfolio, hasJoined, hasLeft, leaderboard } = await getGamePortfolio(rawGame.id, userId, username);

    return NextResponse.json(
      {
        game: sanitizeGame(rawGame),
        portfolio,
        hasJoined,
        hasLeft,
        leaderboard,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(`[API /api/games/${params.id} GET] error:`, err.message);
    return NextResponse.json({ error: 'Failed to load game session', message: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await request.json();
    const { userId, ticker, type, shares, orderType, price, username } = body;

    if (!userId || !ticker || !shares || !type) {
      return NextResponse.json({ error: 'Missing required trade parameters' }, { status: 400 });
    }

    const result = await executeGameTrade({
      gameId,
      userId,
      ticker,
      type,
      shares: Number(shares),
      orderType: orderType || 'MARKET',
      price: price ? Number(price) : undefined,
      username,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error(`[API /api/games/${params.id} POST] error:`, err.message);
    return NextResponse.json({ error: 'Trade execution failed', message: err.message }, { status: 400 });
  }
}
