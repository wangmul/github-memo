import { SimpleGit, simpleGit } from 'simple-git';

const git: SimpleGit = simpleGit();

export interface GitStatus {
    not_added: string[];
    created: string[];
    deleted: string[];
    modified: string[];
    renamed: { from: string; to: string }[];
    staged: string[];
}

export async function initRepo() {
    try {
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            await git.init();
            console.log('Git repo initialized');
        }

        // Auto-configure remote if missing and env vars exist
        // This handles cases where remote wasn't set or lost
        const remotes = await git.getRemotes();
        if (!remotes.some(r => r.name === 'origin')) {
            if (process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
                console.log('Auto-configuring missing remote from env...');
                const authUrl = `https://${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}.git`;
                await git.addRemote('origin', authUrl);
            }
        }

        return true;
    } catch (error) {
        console.error('Failed to init repo:', error);
        return false;
    }
}

export async function getStatus(): Promise<GitStatus> {
    const status = await git.status();
    return {
        not_added: status.not_added,
        created: status.created,
        deleted: status.deleted,
        modified: status.modified,
        renamed: status.renamed,
        staged: status.staged,
    };
}

export async function stageAll() {
    await git.add('.');
}

export async function commit(message: string) {
    await git.add('.');
    await git.commit(message);
}

export async function push() {
    const remotes = await git.getRemotes();
    if (remotes.length === 0) {
        throw new Error('No remote configured');
    }

    try {
        await git.push();
    } catch (error: any) {
        // Handle "no upstream branch" error automatically
        if (error.message.includes('no upstream branch') || error.message.includes('set-upstream')) {
            console.log('No upstream branch, setting upstream and pushing...');
            const status = await git.status();
            const currentBranch = status.current;
            if (currentBranch) {
                await git.push('origin', currentBranch, { '--set-upstream': null });
            }
        } else {
            console.error('Push failed:', error);
            throw new Error(`Push failed: ${error.message}`);
        }
    }
}

export async function setRemote(url: string) {
    const remotes = await git.getRemotes();
    if (remotes.some(r => r.name === 'origin')) {
        await git.removeRemote('origin');
    }
    await git.addRemote('origin', url);
}

export async function getHistory() {
    try {
        const log = await git.log();
        return log.all;
    } catch (e) {
        return [];
    }
}

export async function getRemoteUrl(): Promise<string | null> {
    try {
        const remotes = await git.getRemotes(true);
        const origin = remotes.find(r => r.name === 'origin');
        return origin ? origin.refs.fetch : null;
    } catch {
        return null;
    }
}
