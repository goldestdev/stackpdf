'use client';

import { Heart } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-white/5 mt-auto">
            <div className="container py-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500">
                    <span>&copy; {currentYear} StackPDF</span>

                    <span className="hidden sm:block text-gray-700">•</span>

                    <span className="flex items-center gap-1.5">
                        Made with <Heart size={14} className="text-red-500 fill-red-500" /> by{' '}
                        <a
                            href="https://github.com/goldestdev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            GoldestDev
                        </a>
                    </span>

                    <span className="hidden sm:block text-gray-700">•</span>

                    <a
                        href="https://github.com/goldestdev/stackpdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                        View Source
                    </a>
                </div>
            </div>
        </footer>
    );
}
