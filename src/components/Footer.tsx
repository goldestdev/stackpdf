'use client';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/5 bg-[#0f1115]/30 backdrop-blur-sm mt-auto">
            <div className="container mx-auto py-8">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <p className="text-gray-500 text-sm">
                        &copy; {currentYear} StackPDF. All rights reserved.
                    </p>
                    <p className="text-gray-600 text-xs">
                        Built by <span className="text-gray-400 font-medium">GoldestDev</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
