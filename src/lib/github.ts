import { Octokit } from 'octokit';

// Singleton instance
let octokitInstance: Octokit | null = null;

export function getOctokit(token?: string) {
    if (token) {
        octokitInstance = new Octokit({ auth: token });
    }
    return octokitInstance;
}

export async function getIssues(owner: string, repo: string) {
    const kit = getOctokit();
    if (!kit) throw new Error('Octokit not initialized');

    const { data } = await kit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        per_page: 20,
    });
    return data;
}

export async function createIssue(owner: string, repo: string, title: string, body: string) {
    const kit = getOctokit();
    if (!kit) throw new Error('Octokit not initialized');

    const { data } = await kit.rest.issues.create({
        owner,
        repo,
        title,
        body,
    });
    return data;
}

export async function triggerWorkflow(owner: string, repo: string, workflowId: string, ref: string = "main") {
    const kit = getOctokit();
    if (!kit) throw new Error('Octokit not initialized');

    await kit.rest.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: workflowId,
        ref,
    });
}
