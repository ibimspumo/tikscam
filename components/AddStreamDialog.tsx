'use client';

/**
 * AddStreamDialog Component
 *
 * Dialog zum Hinzufügen eines neuen Streams
 * - Username Input
 * - Validierung
 * - Keyboard Shortcuts (Enter to submit, Escape to close)
 */

import { useState, useEffect, useRef } from 'react';

interface AddStreamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (username: string) => void;
}

export function AddStreamDialog({ isOpen, onClose, onAdd }: AddStreamDialogProps) {
  const [username, setUsername] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && username.trim()) {
        handleAdd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, username, onClose]);

  const handleAdd = () => {
    if (username.trim()) {
      onAdd(username.trim());
      setUsername('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Stream hinzufügen
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Gib den TikTok-Benutzernamen des Streamers ein, den du monitoren möchtest.
          </p>

          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="z.B. dom.anyart"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-6"
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleAdd}
              disabled={!username.trim()}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Hinzufügen
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Drücke <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> zum Hinzufügen oder{' '}
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> zum Abbrechen
          </div>
        </div>
      </div>
    </>
  );
}
