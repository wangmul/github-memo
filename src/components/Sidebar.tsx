"use client";

import { cn } from "@/lib/utils";
import { Copy, FileText, GitBranch, Github, Plus, RefreshCw, Save, Settings, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Memo, GitStatus } from "@/types";
import { format } from "date-fns";

interface SidebarProps {
    memos: Memo[];
    currentSlug: string | null;
    onSelect: (slug: string) => void;
    onCreate: () => void;
    onSync: () => void;
    gitStatus: GitStatus | null;
    onOpenSettings: () => void;
    onOpenIssues: () => void;
    className?: string;
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ memos, currentSlug, onSelect, onCreate, onSync, gitStatus, onOpenSettings, onOpenIssues, className, isOpen, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-xl flex flex-col h-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
                className
            )}>
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100 font-bold">
                        <Github className="w-5 h-5" />
                        <span>GH Memo</span>
                    </div>
                    <button onClick={onCreate} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors" title="New Memo">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {memos.map((memo) => {
                        // Extract title and preview from content
                        const lines = memo.content.split('\n').filter(line => line.trim() !== '');
                        const title = lines[0]?.replace(/^#+\s*/, '') || memo.slug;
                        const preview = lines.slice(1).find(l => l.trim() !== '') || "No additional text";

                        return (
                            <button
                                key={memo.slug}
                                onClick={() => {
                                    onSelect(memo.slug);
                                    onClose(); // Close on mobile
                                }}
                                className={cn(
                                    "w-full text-left px-3 py-3 rounded-lg text-sm transition-all flex flex-col gap-1",
                                    currentSlug === memo.slug
                                        ? "bg-white dark:bg-zinc-800 shadow-sm"
                                        : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                                )}
                            >
                                <div className={cn(
                                    "font-medium truncate w-full",
                                    currentSlug === memo.slug ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"
                                )}>
                                    {title}
                                </div>
                                <div className="text-xs text-zinc-500 truncate w-full flex items-center gap-1">
                                    <span className="opacity-75">{format(new Date(), "MM/dd")}</span>
                                    <span>·</span>
                                    <span>{preview}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">
                        <span>Git Status</span>
                        {gitStatus && (
                            <span className={cn("w-2 h-2 rounded-full", (gitStatus.modified.length > 0 || gitStatus.not_added.length > 0) ? "bg-amber-500" : "bg-green-500")} />
                        )}
                    </div>

                    <button
                        onClick={onSync}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Sync</span>
                    </button>

                    <button
                        onClick={onOpenIssues}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Issues</span>
                    </button>

                    <button
                        onClick={onOpenSettings}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Settings</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
