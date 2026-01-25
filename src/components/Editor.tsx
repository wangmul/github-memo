"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, FileEdit, Columns } from "lucide-react";

interface EditorProps {
    content: string;
    slug: string;
    onChange: (content: string) => void;
    onSave: () => void;
}

type ViewMode = 'edit' | 'split' | 'preview';

export function Editor({ content, slug, onChange, onSave }: EditorProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('edit');

    // Debounce auto-save
    useEffect(() => {
        const handler = setTimeout(() => {
            if (content) {
                onSave();
            }
        }, 2000);

        return () => {
            clearTimeout(handler);
        };
    }, [content, onSave]);

    return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold font-sans tracking-tight truncate max-w-[200px] md:max-w-md">{slug}</h1>
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('edit')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'edit' ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                            )}
                            title="Edit"
                        >
                            <FileEdit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('split')}
                            className={cn(
                                "p-1.5 rounded-md transition-all hidden md:block",
                                viewMode === 'split' ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                            )}
                            title="Split View"
                        >
                            <Columns className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={cn(
                                "p-1.5 rounded-md transition-all",
                                viewMode === 'preview' ? "bg-white dark:bg-zinc-800 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                            )}
                            title="Preview"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="text-xs text-zinc-400 hidden sm:block">
                    {content.length} chars
                    <span className="ml-2 inline-flex relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                </div>
            </div>

            <div className="flex-1 relative flex overflow-hidden">
                {/* Editor Area */}
                <div className={cn(
                    "h-full overflow-hidden transition-all duration-300",
                    viewMode === 'edit' ? "w-full" : viewMode === 'split' ? "w-1/2 border-r border-zinc-200 dark:border-zinc-800" : "w-0 hidden"
                )}>
                    <textarea
                        value={content}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-full p-8 resize-none focus:outline-none bg-transparent font-sans text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        placeholder="Write your thoughts..."
                        spellCheck={false}
                    />
                </div>

                {/* Preview Area */}
                <div className={cn(
                    "h-full overflow-y-auto p-8 bg-zinc-50/50 dark:bg-zinc-900/50 transition-all duration-300",
                    viewMode === 'preview' ? "w-full" : viewMode === 'split' ? "w-1/2" : "w-0 hidden"
                )}>
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
