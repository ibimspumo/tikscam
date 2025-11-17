'use client';

import React, { useState } from 'react';
import { useStreamManager } from '@/contexts/StreamManagerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { X, Plus, Info } from 'lucide-react';

interface AddStreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStreamDialog({ open, onOpenChange }: AddStreamDialogProps) {
  const [username, setUsername] = useState('');
  const { addStream } = useStreamManager();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    const cleanUsername = username.trim().replace('@', '');
    addStream(cleanUsername);
    setUsername('');
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-stream-title"
      aria-describedby="add-stream-description"
    >
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle id="add-stream-title" className="text-xl">{t('addStreamDialog.title')}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription id="add-stream-description">
            {t('addStreamDialog.description')}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                {t('addStreamDialog.usernameLabel')}
              </label>
              <Input
                id="username"
                type="text"
                placeholder={t('addStreamDialog.usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">{t('addStreamDialog.important')}</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{t('addStreamDialog.requirement1')}</li>
                  <li>{t('addStreamDialog.requirement2')}</li>
                  <li>{t('addStreamDialog.requirement3')}</li>
                </ul>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('addStreamDialog.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!username.trim()}
              className="flex-1 gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('addStreamDialog.startStream')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
