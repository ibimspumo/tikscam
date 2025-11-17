'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Key, ExternalLink } from 'lucide-react';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  error?: string | null;
}

export function ApiKeyDialog({ isOpen, onClose, onSubmit, error }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
      aria-describedby="api-key-description"
    >
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle id="api-key-title" className="text-xl flex items-center gap-2">
            <Key className="h-5 w-5" />
            EulerStream API Key Required
          </CardTitle>
          <CardDescription id="api-key-description">
            The server&apos;s API key couldn&apos;t connect after 3 attempts. Please enter your own
            EulerStream API key to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="api-key-input" className="text-sm font-medium">
                API Key
              </label>
              <Input
                id="api-key-input"
                type="text"
                placeholder="Enter your EulerStream API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
                aria-required="true"
              />
            </div>

            <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
              <p className="font-medium">How to get your API key:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Visit EulerStream pricing page</li>
                <li>Sign up for a free account</li>
                <li>Copy your API key from the dashboard</li>
                <li>Paste it above to connect</li>
              </ol>
              <a
                href="https://www.eulerstream.com/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline mt-2"
              >
                Get API Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!apiKey.trim()}>
                Connect with API Key
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
