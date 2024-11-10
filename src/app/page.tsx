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

export default function Home() {
    const [theme, setTheme] = useState("light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <div className={`flex flex-col justify-between min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100 dark:bg-gray-800 ${theme}`}>
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">Welcome to QuickPic Tools</h1>
                    <p className="text-lg text-gray-800 dark:text-gray-300">
                        Hi. I&apos;m
                        <a href="https://twitter.com/t3dotgg" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500 ml-1">
                            Theo
                        </a>
                        . I built these tools because I was annoyed they did not exist.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                    <Link href="/svg-to-png" className="tool-card">
                        <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-gray-800 dark:text-gray-200 text-xl font-semibold mb-2">SVG to PNG Converter</h2>
                            <p className="text-gray-600 dark:text-gray-400">Convert your SVG files to PNG format easily.</p>
                        </div>
                    </Link>
                    <Link href="/square-image" className="tool-card">
                        <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-gray-800 dark:text-gray-200 text-xl font-semibold mb-2">Square Image Generator</h2>
                            <p className="text-gray-600 dark:text-gray-400">Generate square images for your projects.</p>
                        </div>
                    </Link>
                    <Link href="/rounded-border" className="tool-card">
                        <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-gray-800 dark:text-gray-200 text-xl font-semibold mb-2">Corner Rounder</h2>
                            <p className="text-gray-600 dark:text-gray-400">Easily round the corners of your images.</p>
                        </div>
                    </Link>
                </div>
            </main>
            <footer className="text-center text-sm text-gray-500 mt-8 dark:text-gray-400">
                <a href="https://github.com/t3dotgg/quickpic" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    View on GitHub
                </a>
            </footer>
        </div>
    );
}
