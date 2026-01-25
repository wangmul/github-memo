"use client";

import { useState, useEffect } from "react";
import { Settings } from "lucide-react";

export function SettingsModal({ onClose }: { onClose: () => void }) {
    const [token, setToken] = useState("");
    const [owner, setOwner] = useState("");
    const [repo, setRepo] = useState("");
    const [remoteUrl, setRemoteUrl] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.token) setToken(data.token); // Or handle masked
                    if (data.owner) setOwner(data.owner);
                    if (data.repo) setRepo(data.repo);
                    if (data.remoteUrl) setRemoteUrl(data.remoteUrl);
                }
            } catch (e) {
                console.error("Failed to load settings");
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        await fetch("/api/settings", {
            method: "POST",
            body: JSON.stringify({ token, owner, repo }),
        });

        if (remoteUrl) {
            await fetch("/api/git", {
                method: "POST",
                body: JSON.stringify({ action: "set_remote", url: remoteUrl }),
            });
        }

        onClose();
        alert("Settings saved!");
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-2xl w-96 border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Settings
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">GitHub Token</label>
                        <input
                            type="password"
                            value={token}
                            onChange={e => setToken(e.target.value)}
                            className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="ghp_..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Git Remote URL</label>
                        <input
                            type="text"
                            value={remoteUrl}
                            onChange={e => setRemoteUrl(e.target.value)}
                            className="w-full p-2 rounded border dark:bg-zinc-800 dark:border-zinc-700"
                            placeholder="https://github.com/user/repo.git"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Required for Sync/Push functionality.</p>
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

                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={onClose} className="px-4 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
