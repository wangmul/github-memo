export interface Memo {
    slug: string;
    content: string;
    updatedAt: string; // Serialized date
    path?: string; // Optional: Store original file path (e.g., data/foo.md)
    sha?: string; // GitHub SHA for updates
}

export interface GitStatus {
    not_added: string[];
    created: string[];
    deleted: string[];
    modified: string[];
    renamed: { from: string; to: string }[];
    staged: string[];
}
