'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { openDB, IDBPDatabase } from 'idb';

export interface HistoryItem {
    id: string;
    filename: string;
    tool: string;
    timestamp: number;
    fileBlob: Blob; // Not stored in localStorage, but in IDB
}

interface HistoryContextType {
    history: HistoryItem[];
    addToHistory: (fileBlob: Blob, filename: string, tool: string) => Promise<void>;
    removeFromHistory: (id: string) => Promise<void>;
    clearHistory: () => Promise<void>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const DB_NAME = 'stackpdf-db';
const STORE_NAME = 'files';

async function initDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        },
    });
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // Load initial metadata from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('stackpdf_history_meta');
        if (stored) {
            try {
                const meta = JSON.parse(stored);
                // We don't load blobs immediately to save memory, only when requested?
                // For simplicity MVP: We just load the list. The blob will be fetched from IDB when needed (e.g. download).
                // Actually, to display effectively, we might not need the blob in state unless selected.
                // But for "addToHistory" to update UI immediately, we keep full state.
                // Let's iterate and hydrate from IDB for the initial load to ensure consistency.
                hydrateFromIDB(meta);
            } catch (e) {
                console.error('Failed to parse history meta', e);
            }
        }
    }, []);

    const hydrateFromIDB = async (meta: Omit<HistoryItem, 'fileBlob'>[]) => {
        const db = await initDB();
        const items: HistoryItem[] = [];
        for (const m of meta) {
            try {
                const blob = await db.get(STORE_NAME, m.id);
                if (blob) {
                    items.push({ ...m, fileBlob: blob });
                }
            } catch (e) {
                console.warn(`Failed to retrieve blob for ${m.id}`, e);
            }
        }
        // Sort by newest
        items.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(items);
    };

    const addToHistory = async (fileBlob: Blob, filename: string, tool: string) => {
        const id = crypto.randomUUID();
        const newItem: HistoryItem = {
            id,
            filename,
            tool,
            timestamp: Date.now(),
            fileBlob
        };

        // 1. Save to IDB
        const db = await initDB();
        await db.put(STORE_NAME, fileBlob, id);

        // 2. Update State
        const newHistory = [newItem, ...history].slice(0, 10); // Keep max 10
        setHistory(newHistory);

        // 3. Save Meta to LocalStorage
        const meta = newHistory.map(({ fileBlob, ...rest }) => rest);
        localStorage.setItem('stackpdf_history_meta', JSON.stringify(meta));
    };

    const removeFromHistory = async (id: string) => {
        const db = await initDB();
        await db.delete(STORE_NAME, id);

        const newHistory = history.filter(h => h.id !== id);
        setHistory(newHistory);

        const meta = newHistory.map(({ fileBlob, ...rest }) => rest);
        localStorage.setItem('stackpdf_history_meta', JSON.stringify(meta));
    };

    const clearHistory = async () => {
        const db = await initDB();
        await db.clear(STORE_NAME);
        setHistory([]);
        localStorage.removeItem('stackpdf_history_meta');
    };

    return (
        <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory, clearHistory }}>
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistory() {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
}
