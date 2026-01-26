"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Editor } from "./Editor";
import { SettingsModal } from "./SettingsModal";
import { IssuesPanel } from "./IssuesPanel";
import { format } from "date-fns";
import { RefreshCw } from "lucide-react";
import { Toast } from "./Toast";
import { Memo, GitStatus } from "@/types";
import { storage } from "@/lib/storage";
import { GitHubClient } from "@/lib/github-client";

export function MemoApp() {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [content, setContent] = useState<string>("");
    const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isIssuesOpen, setIsIssuesOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [syncState, setSyncState] = useState<'idle' | 'saving' | 'synced' | 'pending' | 'error'>('idle');

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: "",
        type: 'info',
        isVisible: false
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    // Load Memos from Local Storage on Mount
    useEffect(() => {
        const localMemos = storage.getMemos();
        localMemos.sort((a, b) => b.slug.localeCompare(a.slug)); // Sort initial load
        setMemos(localMemos);

        // Auto-select most recent memo if available
        if (localMemos.length > 0) {
            setCurrentSlug(localMemos[0].slug);
            setContent(localMemos[0].content);
        }

        performSync("pull"); // Attempt to pull latest changes on load
    }, []);

    // Sync Logic
    const performSync = async (action: "pull" | "push") => {
        const settings = storage.getSettings();
        if (!settings) {
            console.log("No settings found, skipping sync");
            if (action === "push") showToast("Please configure GitHub settings first", "error");
            return;
        }

        const client = new GitHubClient(settings);

        try {
            if (action === "pull") {
                // Simplified Pull: Just fetch list for now (Real sync is complex)
                // In v3 MVP, we trust local first, but maybe we should list remote
                const remoteFiles = await client.getMemoList();
                console.log("Remote files found:", remoteFiles.length);

                // Fetch content for each file (Parallel)
                // Fetch content for each file (Parallel)
                const fetchedRemoteMemos: Memo[] = await Promise.all(remoteFiles.map(async (file: any) => {
                    const fileData = await client.getFile(file.path);
                    return {
                        slug: file.slug,
                        content: fileData?.content || "",
                        updatedAt: new Date().toISOString(),
                        path: file.path,
                        sha: fileData?.sha, // Store SHA
                    };
                }));

                // MERGE STRATEGY (Critical Fix for Data Loss)
                // 1. Create a map of current local memos
                const localMap = new Map(memos.map(m => [m.slug, m]));

                const mergedMemos = [...fetchedRemoteMemos];

                // 2. Identify local-only memos (not in remote) and keep them
                // This handles the case where I created a memo offline, and remote sync didn't have it yet.
                // If I just replaced with remote, my new memo would vanish.
                memos.forEach(localMemo => {
                    const existsRemote = mergedMemos.find(r => r.slug === localMemo.slug);
                    if (!existsRemote) {
                        mergedMemos.push(localMemo);
                    } else {
                        // Conflict: Both exist. 
                        // If I have unsaved local changes (isSaving?), local might be newer.
                        // For v3 MVP: We trust Remote for now if we are pulling, BUT
                        // if local storage was just loaded, it might be stale. 
                        // Ideally: Compare timestamps if we had them.
                        // Safer approach for "disappearing": If local has content and remote is empty (error?), keep local?
                        if (existsRemote.content === "" && localMemo.content !== "") {
                            // Remote failed or empty? Keep local.
                            console.warn("Remote content empty, keeping local for", localMemo.slug);
                            // Keep local content but take remote SHA to enable future updates
                            const index = mergedMemos.indexOf(existsRemote);
                            mergedMemos[index] = { ...localMemo, sha: existsRemote.sha };
                        }
                    }
                });

                // Sort: Newest First (Desc by slug)
                mergedMemos.sort((a, b) => b.slug.localeCompare(a.slug));

                setMemos(mergedMemos);
                storage.saveMemos(mergedMemos);
            } else if (action === "push") {
                // Push current memo
                if (!currentSlug) return;
                const memo = memos.find(m => m.slug === currentSlug);
                if (!memo) return;

                setSyncState('saving');
                // Use original path if exists, otherwise default to root {slug}.md
                const targetPath = memo.path || `${memo.slug}.md`;

                // If no SHA (newly created local file), try to fetch it first just in case it exists on remote
                // to avoid 422 error.
                let shaToUse = memo.sha;
                if (!shaToUse) {
                    try {
                        const existing = await client.getFile(targetPath);
                        if (existing?.sha) {
                            shaToUse = existing.sha;
                        }
                    } catch (e) {
                        // Ignore 404
                    }
                }

                const response = await client.saveFile(
                    targetPath,
                    memo.content,
                    `Update ${memo.slug}`,
                    shaToUse
                );

                // Update local memo with new SHA
                const newSha = response.content?.sha;
                if (newSha) {
                    const updatedMemos = memos.map(m =>
                        m.slug === currentSlug ? { ...m, sha: newSha } : m
                    );
                    setMemos(updatedMemos);
                    storage.saveMemos(updatedMemos);
                }

                setSyncState('synced');
                showToast("Synced to GitHub", "success");
                setTimeout(() => setSyncState('idle'), 2000);
            }
        } catch (e: any) {
            console.error("Sync failed", e);
            setSyncState('error');
            const errorMessage = e.message || "Sync failed. Check console.";
            showToast(`Sync Failed: ${errorMessage}`, "error");
        }
    };

    const handleSelect = (slug: string) => {
        setCurrentSlug(slug);
        const memo = memos.find((m) => m.slug === slug);
        if (memo) setContent(memo.content);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    const handleCreate = () => {
        const slug = `memo-${format(new Date(), "yyyyMMdd-HHmmss")}`;
        const newMemo = { slug, content: "", updatedAt: new Date().toISOString() };
        const updatedMemos = [newMemo, ...memos].sort((a, b) => b.slug.localeCompare(a.slug));

        setMemos(updatedMemos);
        storage.saveMemos(updatedMemos);

        setCurrentSlug(slug);
        setContent("");
    };

    const handleSave = (newContent: string) => {
        setContent(newContent);
        if (currentSlug) {
            const updatedMemos = memos.map(m =>
                m.slug === currentSlug ? { ...m, content: newContent, updatedAt: new Date().toISOString() } : m
            );
            setMemos(updatedMemos);
            storage.saveMemos(updatedMemos);
        }
    };

    const handleDelete = async (slug: string) => {
        // 1. Remove from Local State & Storage
        const updatedMemos = memos.filter(m => m.slug !== slug);
        setMemos(updatedMemos);
        storage.saveMemos(updatedMemos);

        if (currentSlug === slug) {
            setCurrentSlug(null);
            setContent("");
        }

        // 2. Remove from Remote (Background)
        const settings = storage.getSettings();
        if (!settings) return;

        const client = new GitHubClient(settings);
        const memo = memos.find(m => m.slug === slug);

        if (memo) {
            try {
                // We need the SHA to delete, but getFile fetches it.
                // Or if we have it locally? We don't store SHA locally yet in v3 MVP (simplicity).
                // So we fetch it first.
                const targetPath = memo.path || `${memo.slug}.md`;
                const fileData = await client.getFile(targetPath);

                if (fileData?.sha) {
                    await client.deleteFile(targetPath, `Delete ${memo.slug}`, fileData.sha);
                    console.log(`Deleted ${slug} from remote`);
                }
            } catch (e) {
                console.error("Failed to delete from remote", e);
                // Ideally queue for retry or show error
            }
        }
    };

    // Auto-Sync Trigger (Debounce handled by Editor, but Editor calls onSave directly now)
    // We need to trigger the GitHub Push here when "saving" happens nicely
    // Or we keep it simple: Editor calls onSave (Local), and we debounce a Push here?
    // Let's rely on Editor's debounce calling a specific prop if needed, or better:
    // Update Editor to call onSave (Local Persist) frequently, and onCommit (Remote Push) less frequently?
    // For now, let's hooking into the "Saved" event from Editor to trigger push

    // Actually, in the Editor component, onSave is used for "Auto-Save".
    // We can use that existing hook.

    const handleAutoSaveTrigger = useCallback(() => {
        // This is called by Editor when it debounces stops (2s)
        // We will trigger a GitHub Push here
        if (navigator.onLine) {
            performSync("push");
        } else {
            setSyncState('pending');
        }
    }, [currentSlug, memos]);

    return (
        <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl flex items-center justify-between px-4 z-30">
                <div className="flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="ml-2 font-bold text-lg">GH Memo</span>
                </div>

                {/* Mobile Sync Button */}
                <button
                    onClick={() => performSync("push")}
                    disabled={syncState === 'saving'}
                    className={`p-2 rounded-full transition-all ${syncState === 'saving'
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
                        }`}
                >
                    <RefreshCw className={`w-5 h-5 ${syncState === 'saving' ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <Sidebar
                memos={memos}
                currentSlug={currentSlug}
                onSelect={handleSelect}
                onCreate={handleCreate}
                onDelete={handleDelete}
                onSync={() => performSync("pull")}
                gitStatus={gitStatus}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenIssues={() => setIsIssuesOpen(true)}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />
            <main className="flex-1 h-full pt-14 md:pt-0 flex flex-col">
                {currentSlug ? (
                    <>
                        {/* Desktop Header (Only visible on MD+) */}
                        <div className="hidden md:flex h-14 border-b border-zinc-200 dark:border-zinc-800 items-center justify-between px-6 bg-white dark:bg-black">
                            <div className="font-medium text-zinc-500 text-sm">
                                {memos.find(m => m.slug === currentSlug)?.slug}
                            </div>

                            <button
                                onClick={() => performSync("push")}
                                disabled={syncState === 'saving'}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${syncState === 'saving'
                                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
                                    }`}
                                title="Push to GitHub"
                            >
                                <RefreshCw className={`w-4 h-4 ${syncState === 'saving' ? 'animate-spin' : ''}`} />
                                <span>{syncState === 'saving' ? 'Syncing...' : 'Sync'}</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden">
                            <Editor
                                slug={currentSlug}
                                content={content}
                                onChange={handleSave}
                                onSave={handleAutoSaveTrigger} // Calls sync push
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">Welcome</h2>
                            <p className="mb-6">Select a memo or create a new one to get started.</p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleCreate}
                                    className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
                                >
                                    Create New Memo
                                </button>
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors"
                                >
                                    Configure GitHub Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
            {isIssuesOpen && <IssuesPanel onClose={() => setIsIssuesOpen(false)} />}

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}
