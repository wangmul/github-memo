import { NextResponse } from 'next/server';
import { getIssues } from '@/lib/github';
import fs from 'fs/promises';
import path from 'path';

const ENV_PATH = path.join(process.cwd(), '.env.local');

async function getConfig() {
    try {
        const envContent = await fs.readFile(ENV_PATH, 'utf-8');
        const config: Record<string, string> = {};
        envContent.split('\n').forEach(line => {
            const [k, v] = line.split('=');
            if (k) config[k.trim()] = v?.trim() || '';
        });
        return config;
    } catch {
        return {};
    }
}

export async function GET() {
    const config = await getConfig();
    if (!config.GITHUB_TOKEN || !config.GITHUB_OWNER || !config.GITHUB_REPO) {
        return NextResponse.json({ error: 'GitHub config missing' }, { status: 400 });
    }

    // We must init octokit with the token from "config" if not globally set?
    // My lib/github 'getOctokit' is a singleton.
    // I should tweak 'getOctokit' to accept token or use a fresh one.
    // But 'getIssues' uses 'getOctokit()'.

    // Hack: Re-init singleton with the token.
    const { getOctokit } = require('@/lib/github');
    getOctokit(config.GITHUB_TOKEN);

    try {
        const issues = await getIssues(config.GITHUB_OWNER, config.GITHUB_REPO);
        return NextResponse.json(issues);
    } catch (e: any) { // Type 'any' used to handle unknown error structure
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
