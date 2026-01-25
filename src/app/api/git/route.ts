import { NextResponse } from 'next/server';
import { getStatus, commit, initRepo, push, setRemote } from '@/lib/git';

export async function GET() {
    await initRepo(); // Ensure repo is initialized
    const status = await getStatus();
    return NextResponse.json(status);
}

export async function POST(request: Request) {
    const { action, message } = await request.json();

    if (action === 'commit') {
        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });
        await commit(message);
        return NextResponse.json({ success: true });
    }

    if (action === 'push') {
        try {
            await push();
            return NextResponse.json({ success: true });
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
    }

    if (action === 'set_remote') {
        const { url } = await request.json();
        if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });
        await setRemote(url);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
