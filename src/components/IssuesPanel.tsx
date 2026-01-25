"use client";

import { useState, useEffect } from "react";
import { AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

export function IssuesPanel({ onClose }: { onClose: () => void }) {
    const [issues, setIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/github/issues");
            if (res.ok) {
                const data = await res.json();
                setIssues(data);
            }
        } catch {
            // error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-40 flex flex-col transform transition-transform">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur">
                <h2 className="font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> GitHub Issues
                </h2>
                <div className="flex gap-2">
                    <button onClick={fetchIssues} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded">
                        ✕
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {issues.length === 0 && !loading && (
                    <div className="text-center text-zinc-500 mt-10">No issues found or not configured.</div>
                )}

                {issues.map(issue => (
                    <div key={issue.id} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-blue-500 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium text-sm leading-snug">{issue.title}</h3>
                            <span className="text-xs text-zinc-400">#{issue.number}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${issue.state === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-purple-100 text-purple-700'}`}>
                                {issue.state}
                            </span>
                            <a href={issue.html_url} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink className="w-3 h-3 text-zinc-500" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
