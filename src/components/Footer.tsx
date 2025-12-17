'use client';

import { Heart, Github, Code2 } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/5 bg-[#0f1115]/30 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Brand & Copyright */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <h3 className="text-lg font-bold text-white tracking-tight">StackPDF</h3>
                        <p className="text-sm text-gray-500">
                            Your personal local PDF Swiss Army Knife.
                        </p>
                        <span className="text-xs text-gray-600 mt-1">
                            &copy; {currentYear} GoldestDev. All rights reserved.
                        </span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-8">
                        <a
                            href="https://github.com/goldestdev/stackpdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Github size={18} />
                            </div>
                            <span className="hidden sm:inline">Source Code</span>
                        </a>

                        <div className="h-8 w-px bg-white/5 hidden md:block"></div>

                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Created By</span>
                            <a
                                href="https://github.com/goldestdev"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-colors"
                            >
                                GoldestDev
                                <Heart size={14} className="text-red-500/80 fill-red-500/80" />
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
}
