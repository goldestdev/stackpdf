'use client';

import { useState } from 'react';
import { useHistory } from '@/context/HistoryContext';
import { History, Download, Trash2, X, FileText, Clock } from 'lucide-react';
import { downloadBlob } from '@/utils/file-utils';

export default function HistorySidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { history, removeFromHistory, clearHistory } = useHistory();

    const handleDownload = (blob: Blob, filename: string) => {
        downloadBlob(blob, filename);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
                title="Recent Files"
            >
                <History size={24} />
            </button>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-[#181b21] border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History size={20} className="text-blue-500" />
                        Recent Files
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 h-[calc(100vh-140px)] overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">
                            <Clock size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No recent files.</p>
                            <p className="text-xs mt-1">Files you process will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {history.map((item) => (
                                <div key={item.id} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText size={16} className="text-blue-400 flex-shrink-0" />
                                            <span className="text-sm font-medium truncate" title={item.filename}>{item.filename}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                        <span>{item.tool}</span>
                                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDownload(item.fileBlob, item.filename)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs font-medium transition-colors"
                                        >
                                            <Download size={14} /> Download
                                        </button>
                                        <button
                                            onClick={() => removeFromHistory(item.id)}
                                            className="px-2 py-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {history.length > 0 && (
                    <div className="absolute bottom-0 w-full p-4 border-t border-white/10 bg-[#181b21]">
                        <button
                            onClick={clearHistory}
                            className="w-full py-2 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                        >
                            <Trash2 size={16} /> Clear History
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
