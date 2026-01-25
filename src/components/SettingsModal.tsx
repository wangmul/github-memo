"use client";

import { useState, useEffect } from "react";
import { Settings, X, Check, Loader2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { GitHubClient } from "@/lib/github-client";

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const settings = storage.getSettings();
        if (settings) {
            setOwner(settings.owner);
            setRepo(settings.repo);
            setToken(settings.token);
        }
    }, []);

    const handleSave = async () => {
        if (!owner || !repo || !token) {
            setMessage({ type: 'error', text: 'All fields are required' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            // Verify connection
            const client = new GitHubClient({ owner, repo, token });
            await client.getMemoList(); // Try to fetch list to verify permissions

            // Save to local storage
            storage.saveSettings({ owner, repo, token });
            setMessage({ type: 'success', text: 'Connected & Saved!' });
            setTimeout(() => {
                onClose();
                window.location.reload(); // Reload to apply changes (e.g. fetch memos)
            }, 1000);
        } catch (e: any) {
            console.error(e);
            setMessage({ type: 'error', text: 'Connection failed. Check token/permissions.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-2xl w-96 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="w-5 h-5" /> Settings
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">GitHub Token</label>
                        <input
                            type="password"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm"
                            placeholder="ghp_..."
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Token with 'repo' scope required.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Owner</label>
                        <input
                            type="text"
                            value={owner}
                            onChange={e => setOwner(e.target.value)}
                            className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Repository</label>
                        <input
                            type="text"
                            value={repo}
                            onChange={e => setRepo(e.target.value)}
                            className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="repo-name"
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Verifying...' : 'Save & Connect'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
