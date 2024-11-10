"use client";
import Link from "next/link";
import { useState } from "react";

function ThemeToggleButton({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
    return (
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-600 rounded-full">
            {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 14 14" fill="none">
                    <path d="M7 1a4.243 4.243 0 0 0 6 6 6 6 0 1 1-6-6" stroke="#09090B" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width={19} height={18} viewBox="0 0 19 18" fill="white">
                    <path d="M9.131.667v1.666m0 13.334v1.666M3.24 3.108l1.175 1.175m9.433 9.434 1.175 1.175M.798 9h1.667m13.333 0h1.667m-13.05 4.717L3.24 14.892M15.023 3.108l-1.175 1.175M12.465 9a3.333 3.333 0 1 1-6.667 0 3.333 3.333 0 0 1 6.667 0" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </button>
    );
}

function BackButton() {
    return (
        <div className="fixed top-4 left-4 z-50">
            <Link href="/" className="px-3 py-1 text-gray-400 hover:text-gray-600 hover:dark:text-gray-200 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
            </Link>
        </div>
    );
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <div className={`flex flex-col justify-between min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100 dark:bg-gray-800 ${theme}`}>
            <BackButton />
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow flex flex-col items-center justify-center">
                {children}
            </main>
            <footer className="text-center text-sm text-gray-500 mt-8 dark:text-gray-400">
                <a href="https://github.com/t3dotgg/quickpic" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    View on GitHub
                </a>
            </footer>
        </div>
    );
}
