"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Editor } from "./Editor";
import { SettingsModal } from "./SettingsModal";
import { IssuesPanel } from "./IssuesPanel";
import { format } from "date-fns";
import { Memo, GitStatus } from "@/types";

export function MemoApp() {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [currentSlug, setCurrentSlug] = useState<string | null>(null);
    const [content, setContent] = useState<string>("");
    const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isIssuesOpen, setIsIssuesOpen] = useState(false);

    const fetchMemos = useCallback(async () => {
        try {
            const res = await fetch("/api/memos");
            if (res.ok) {
                const data = await res.json();
                setMemos(data);
            }
        } catch (e) {
            console.error("Failed to fetch memos", e);
        }
    }, []);

    const fetchGitStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/git");
            if (res.ok) {
                const data = await res.json();
                setGitStatus(data);
            }
        } catch (e) {
            console.error("Failed to fetch git status", e);
        }
    }, []);

    useEffect(() => {
        fetchMemos();
        fetchGitStatus();
    }, [fetchMemos, fetchGitStatus]);

    const handleSelect = async (slug: string) => {
        // Save current before switching?
        setCurrentSlug(slug);
        const memo = memos.find((m) => m.slug === slug);
        if (memo) setContent(memo.content);
    };

    const handleCreate = async () => {
        const slug = `memo-${format(new Date(), "yyyyMMdd-HHmmss")}`;
        const newMemo = { slug, content: "", updatedAt: new Date().toISOString() };
        setMemos([newMemo, ...memos]);
        setCurrentSlug(slug);
        setContent("");
        // Persist immediately
        await fetch("/api/memos", {
            method: "POST",
            body: JSON.stringify({ slug, content: "" }),
        });
        fetchGitStatus();
    };

    const handleSave = async (newContent: string) => {
        setContent(newContent);
        if (currentSlug) {
            // Debounce logic could go here, for now direct save
            // Actually, let's just save to server
            await fetch("/api/memos", {
                method: "POST",
                body: JSON.stringify({ slug: currentSlug, content: newContent }),
            });

            // Update local list modification time?
            const updatedMemos = memos.map(m =>
                m.slug === currentSlug ? { ...m, content: newContent, updatedAt: new Date().toISOString() } : m
            );
            setMemos(updatedMemos);
            fetchGitStatus();
        }
    };

    const handleSync = async () => {
        // 1. Commit
        const message = prompt("Commit message:", `Update ${currentSlug || "memos"}`);
        if (!message) return;

        try {
            const commitRes = await fetch("/api/git", {
                method: "POST",
                body: JSON.stringify({ action: "commit", message }),
            });

            if (!commitRes.ok) {
                const err = await commitRes.json();
                throw new Error(err.error || "Commit failed");
            }

            // 2. Push
            const pushRes = await fetch("/api/git", {
                method: "POST",
                body: JSON.stringify({ action: "push" }),
            });

            if (!pushRes.ok) {
                const err = await pushRes.json();
                // Check if error is related to missing remote
                if (err.error && (err.error.includes("No remote") || err.error.includes("remote configured"))) {
                    if (confirm("Remote repository not configured. Open settings to configure?")) {
                        setIsSettingsOpen(true);
                    }
                    return; // Stop here
                }
                throw new Error(err.error || "Push failed");
            }

            alert("Synced (Committed & Pushed) successfully!");
            fetchGitStatus();
        } catch (e: any) {
            console.error(e);
            alert(`Failed to sync: ${e.message}`);
        }
    };

    return (
        <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden">
            <Sidebar
                memos={memos}
                currentSlug={currentSlug}
                onSelect={handleSelect}
                onCreate={handleCreate}
                onSync={handleSync}
                gitStatus={gitStatus}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenIssues={() => setIsIssuesOpen(true)}
            />
            <main className="flex-1 h-full">
                {currentSlug ? (
                    <Editor
                        slug={currentSlug}
                        content={content}
                        onChange={(val) => handleSave(val)} // Warning: high frequency
                        onSave={() => { }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400">
                        Select or create a memo
                    </div>
                )}
            </main>
            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
            {isIssuesOpen && <IssuesPanel onClose={() => setIsIssuesOpen(false)} />}
        </div>
    );
}
