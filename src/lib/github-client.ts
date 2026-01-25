import { Octokit } from "@octokit/rest";
import { Settings } from "./storage";

export class GitHubClient {
    private octokit: Octokit;
    private owner: string;
    private repo: string;

    constructor(settings: Settings) {
        this.octokit = new Octokit({ auth: settings.token });
        this.owner = settings.owner;
        this.repo = settings.repo;
    }

    async getFile(path: string) {
        try {
            const { data } = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path,
            });

            if ('content' in data) {
                return {
                    content: Buffer.from(data.content, 'base64').toString('utf-8'),
                    sha: data.sha
                };
            }
            return null;
        } catch (e: any) {
            if (e.status === 404) return null;
            throw e;
        }
    }

    async saveFile(path: string, content: string, message: string, sha?: string) {
        await this.octokit.repos.createOrUpdateFileContents({
            owner: this.owner,
            repo: this.repo,
            path,
            message,
            content: Buffer.from(content).toString('base64'),
            sha,
        });
    }

    async getMemoList() {
        try {
            // Use Git Tree API for recursive listing to find files anywhere (e.g., data/ or root)
            // But first, let's try getting the default branch sha
            const { data: repoData } = await this.octokit.repos.get({
                owner: this.owner,
                repo: this.repo,
            });
            const defaultBranch = repoData.default_branch;

            const { data: treeData } = await this.octokit.git.getTree({
                owner: this.owner,
                repo: this.repo,
                tree_sha: defaultBranch,
                recursive: "true",
            });

            if (treeData.tree) {
                return treeData.tree
                    .filter((item: any) => item.type === 'blob' && item.path?.endsWith('.md'))
                    .map((item: any) => ({
                        slug: item.path.split('/').pop()?.replace('.md', '') || item.path.replace('.md', ''),
                        path: item.path,
                        sha: item.sha
                    }));
            }
            return [];
        } catch (e) {
            console.error("Failed to list files", e);
            // Fallback for empty repo or new repo
            return [];
        }
    }
}
