import { NextResponse } from 'next/server';
import { setRemote, getRemoteUrl } from '@/lib/git';
import fs from 'fs/promises';
import path from 'path';

const ENV_PATH = path.join(process.cwd(), '.env.local');

export async function POST(request: Request) {
    const { token, owner, repo } = await request.json();

    let envContent = '';
    try {
        envContent = await fs.readFile(ENV_PATH, 'utf-8');
    } catch {
        // File might not exist
    }

    // Simple replacement or append
    const newLines = [];
    if (token) newLines.push(`GITHUB_TOKEN=${token}`);
    if (owner) newLines.push(`GITHUB_OWNER=${owner}`);
    if (repo) newLines.push(`GITHUB_REPO=${repo}`);

    // Very naive env updater: overwrite for MVP or append if smarter?
    // Let's just overwrite specifically these keys if we were parsing, but for now just write file if empty or append?
    // Safer: Read all lines, replace keys, write back.

    // Quick implementation: Just overwrite/create .env.local with these values for simplicity in MVP
    // Warning: This destroys other env vars.
    // Better: Read, parse, update.

    const lines = envContent.split('\n');
    const newEnv: Record<string, string> = {};
    lines.forEach(line => {
        const [k, v] = line.split('=');
        if (k) newEnv[k.trim()] = v?.trim() || '';
    });

    if (token) newEnv['GITHUB_TOKEN'] = token;
    if (owner) newEnv['GITHUB_OWNER'] = owner;
    if (repo) newEnv['GITHUB_REPO'] = repo;

    const output = Object.entries(newEnv).map(([k, v]) => `${k}=${v}`).join('\n');
    await fs.writeFile(ENV_PATH, output, 'utf-8');

    // Auto-configure git remote if we have all necessary info
    if (newEnv['GITHUB_TOKEN'] && newEnv['GITHUB_OWNER'] && newEnv['GITHUB_REPO']) {
        const authUrl = `https://${newEnv['GITHUB_TOKEN']}@github.com/${newEnv['GITHUB_OWNER']}/${newEnv['GITHUB_REPO']}.git`;
        await setRemote(authUrl);
    }

    return NextResponse.json({ success: true });
}


export async function GET() {
    // Return masked config
    try {
        const envContent = await fs.readFile(ENV_PATH, 'utf-8');
        const config: Record<string, string> = {};
        envContent.split('\n').forEach(line => {
            const [k, v] = line.split('=');
            if (k === 'GITHUB_OWNER') config.owner = v;
            if (k === 'GITHUB_REPO') config.repo = v;
            if (k === 'GITHUB_TOKEN') config.token = v; // Return actual token for local app UX (or mask if preferred)
        });

        // Also get git remote
        const remoteUrl = await getRemoteUrl();
        if (remoteUrl) config.remoteUrl = remoteUrl;

        return NextResponse.json(config);
    } catch {
        return NextResponse.json({});
    }
}
