import { Memo } from "@/types";

const STORAGE_KEYS = {
    MEMOS: "gh-memo:memos",
    SETTINGS: "gh-memo:settings",
};

export interface Settings {
    owner: string;
    repo: string;
    token: string;
}

export const storage = {
    getMemos: (): Memo[] => {
        if (typeof window === "undefined") return [];
        const raw = localStorage.getItem(STORAGE_KEYS.MEMOS);
        return raw ? JSON.parse(raw) : [];
    },

    saveMemos: (memos: Memo[]) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
    },

    getSettings: (): Settings | null => {
        if (typeof window === "undefined") return null;
        const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return raw ? JSON.parse(raw) : null;
    },

    saveSettings: (settings: Settings) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    clear: () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem(STORAGE_KEYS.MEMOS);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }
};
