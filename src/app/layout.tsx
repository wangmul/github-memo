import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "GitHub Memo App",
    description: "Git-based Memo Application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className="antialiased">{children}</body>
        </html>
    );
}
