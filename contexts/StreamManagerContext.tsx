'use client';

/**
 * StreamManagerContext
 *
 * Verwaltet mehrere TikTok Live Streams gleichzeitig
 * - Multi-Tab Support
 * - Unabhängige Stream-Connections
 * - Tab-Switching
 * - Session Persistence
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useTikTokLive } from '@/hooks/useTikTokLive';

interface StreamTab {
  id: string;
  username: string;
  isActive: boolean;
  createdAt: number;
}

interface StreamManagerContextType {
  tabs: StreamTab[];
  activeTabId: string | null;
  addStream: (username: string) => void;
  removeStream: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  getActiveTab: () => StreamTab | null;
}

const StreamManagerContext = createContext<StreamManagerContextType | null>(null);

export function StreamManagerProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<StreamTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Restore tabs from session storage on mount
  useEffect(() => {
    const savedTabs = sessionStorage.getItem('stream-tabs');
    const savedActiveTabId = sessionStorage.getItem('active-tab-id');

    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs);

        if (savedActiveTabId && parsedTabs.find((t: StreamTab) => t.id === savedActiveTabId)) {
          setActiveTabId(savedActiveTabId);
        } else if (parsedTabs.length > 0) {
          setActiveTabId(parsedTabs[0].id);
        }
      } catch (err) {
        console.error('Failed to restore tabs:', err);
      }
    }
  }, []);

  // Save tabs to session storage whenever they change
  useEffect(() => {
    if (tabs.length > 0) {
      sessionStorage.setItem('stream-tabs', JSON.stringify(tabs));
    } else {
      sessionStorage.removeItem('stream-tabs');
    }
  }, [tabs]);

  // Save active tab ID to session storage
  useEffect(() => {
    if (activeTabId) {
      sessionStorage.setItem('active-tab-id', activeTabId);
    } else {
      sessionStorage.removeItem('active-tab-id');
    }
  }, [activeTabId]);

  const addStream = useCallback((username: string) => {
    const newTab: StreamTab = {
      id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username: username.trim(),
      isActive: false,
      createdAt: Date.now(),
    };

    setTabs(prev => {
      // Check if username already exists
      if (prev.some(tab => tab.username === username.trim())) {
        console.warn('Stream already exists:', username);
        return prev;
      }
      return [...prev, newTab];
    });

    // Set as active tab
    setActiveTabId(newTab.id);
  }, []);

  const removeStream = useCallback((tabId: string) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);

      // If we're removing the active tab, switch to another tab
      if (activeTabId === tabId) {
        if (filtered.length > 0) {
          setActiveTabId(filtered[0].id);
        } else {
          setActiveTabId(null);
        }
      }

      return filtered;
    });
  }, [activeTabId]);

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const getActiveTab = useCallback(() => {
    return tabs.find(tab => tab.id === activeTabId) || null;
  }, [tabs, activeTabId]);

  const value: StreamManagerContextType = {
    tabs,
    activeTabId,
    addStream,
    removeStream,
    switchTab,
    getActiveTab,
  };

  return (
    <StreamManagerContext.Provider value={value}>
      {children}
    </StreamManagerContext.Provider>
  );
}

export function useStreamManager() {
  const context = useContext(StreamManagerContext);
  if (!context) {
    throw new Error('useStreamManager must be used within StreamManagerProvider');
  }
  return context;
}
