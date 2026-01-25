import fs from 'fs/promises';
import path from 'path';

import { MEMO_DIR } from '@/lib/utils';

export interface Memo {
    slug: string; // filename without extension
    content: string;
    updatedAt: Date;
}

async function ensureDir() {
    try {
        await fs.access(MEMO_DIR);
    } catch {
        await fs.mkdir(MEMO_DIR, { recursive: true });
    }
}

export async function getMemos(): Promise<Memo[]> {
    await ensureDir();
    const files = await fs.readdir(MEMO_DIR);
    const memos = await Promise.all(
        files
            .filter((file) => file.endsWith('.md'))
            .map(async (file) => {
                const filePath = path.join(MEMO_DIR, file);
                const stats = await fs.stat(filePath);
                const content = await fs.readFile(filePath, 'utf-8');
                return {
                    slug: file.replace(/\.md$/, ''),
                    content,
                    updatedAt: stats.mtime,
                };
            })
    );
    // Sort by updatedAt desc
    return memos.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getMemo(slug: string): Promise<Memo | null> {
    await ensureDir();
    try {
        const filePath = path.join(MEMO_DIR, `${slug}.md`);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        return {
            slug,
            content,
            updatedAt: stats.mtime,
        };
    } catch {
        return null;
    }
}

export async function saveMemo(slug: string, content: string): Promise<void> {
    await ensureDir();
    const filePath = path.join(MEMO_DIR, `${slug}.md`);
    await fs.writeFile(filePath, content, 'utf-8');
}

export async function deleteMemo(slug: string): Promise<void> {
    await ensureDir();
    const filePath = path.join(MEMO_DIR, `${slug}.md`);
    await fs.unlink(filePath);
}
