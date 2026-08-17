import { NextRequest, NextResponse } from 'next/server';
import { verifyGamePassword } from '@/lib/games/games-service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    const body = await request.json().catch(() => ({}));
    const { password, userId } = body;

    const result = await verifyGamePassword(gameId, password, userId);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'ACCESS_DENIED',
          message: result.message || 'Incorrect tournament password. Access denied.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authorized: true,
        isCreator: Boolean(result.isCreator),
        game: result.game,
        message: 'Tournament password verified successfully.',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(`[API /api/games/${params.id}/verify POST] error:`, err.message);
    return NextResponse.json(
      { success: false, error: 'VERIFICATION_FAILED', message: err.message },
      { status: 500 }
    );
  }
}
