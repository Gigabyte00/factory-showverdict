import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

function requireRevalidationSecret() {
  const expectedSecret = process.env.REVALIDATION_SECRET;
  if (!expectedSecret) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: 'REVALIDATION_SECRET is not configured' },
        { status: 503 }
      ),
    };
  }

  return { ok: true as const, expectedSecret };
}

function isAuthorized(request: NextRequest, expectedSecret: string, bodySecret?: string) {
  // Accept Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    if (token === expectedSecret) return true;
  }

  // Accept body secret (backwards compat with n8n)
  if (bodySecret && bodySecret === expectedSecret) return true;

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const secretCheck = requireRevalidationSecret();
    if (!secretCheck.ok) return secretCheck.response;

    const body = await request.json();
    const { path, tag, secret } = body;

    if (!isAuthorized(request, secretCheck.expectedSecret, secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        path,
        timestamp: new Date().toISOString(),
      });
    }

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        type: 'tag',
        tag,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Missing path or tag parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}
