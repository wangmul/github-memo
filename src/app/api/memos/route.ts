import { NextResponse } from 'next/server';
import { getMemos, saveMemo, deleteMemo } from '@/lib/fs';

export async function GET() {
    const memos = await getMemos();
    return NextResponse.json(memos);
}

export async function POST(request: Request) {
    const { slug, content } = await request.json();
    await saveMemo(slug, content);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (slug) {
        await deleteMemo(slug);
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false }, { status: 400 });
}
