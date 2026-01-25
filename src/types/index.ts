export interface Memo {
    slug: string;
    content: string;
    updatedAt: string; // Serialized date
}

export interface GitStatus {
    not_added: string[];
    created: string[];
    deleted: string[];
    modified: string[];
    renamed: { from: string; to: string }[];
    staged: string[];
}
