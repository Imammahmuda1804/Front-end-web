import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

function isAuthorized(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== 'production';
  }

  const providedSecret =
    request.headers.get('x-revalidate-secret') ||
    request.nextUrl.searchParams.get('secret');

  return providedSecret === secret;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { tag } = await request.json();
    
    if (!tag) {
      return NextResponse.json({ message: 'Missing tag param' }, { status: 400 });
    }
    
    revalidateTag(tag);
    
    return NextResponse.json({ revalidated: true, tag });
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
