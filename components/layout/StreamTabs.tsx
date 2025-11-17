'use client';

import React from 'react';
import { useStreamManager } from '@/contexts/StreamManagerContext';
import { StreamMonitor } from './StreamMonitor';
import { AddStreamDialog } from '@/components/dialogs/AddStreamDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function StreamTabs() {
  const { tabs, activeTabId, switchTab, removeStream } = useStreamManager();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col">
      {tabs.length === 0 ? (
        // Empty State
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('streamTabs.welcome')}</h2>
              <p className="text-muted-foreground">
                {t('streamTabs.welcomeDescription')}
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowAddDialog(true)}
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              {t('streamTabs.addStream')}
            </Button>
          </div>
        </div>
      ) : (
        // Tabs View
        <div className="flex-1 flex flex-col">
          <div className="border-b bg-card">
            <div className="container mx-auto px-4">
              <Tabs
                value={activeTabId || undefined}
                onValueChange={switchTab}
                className="w-full"
              >
                <div className="flex items-center justify-between py-2">
                  <TabsList className="h-auto p-1">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="relative group"
                      >
                        <span className="mr-2">@{tab.username}</span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStream(tab.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-destructive"
                          role="button"
                          aria-label={`Remove stream @${tab.username}`}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('streamTabs.addStream')}
                  </Button>
                </div>

                {tabs.map((tab) => (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="mt-0"
                  >
                    <StreamMonitor
                      username={tab.username}
                      isActive={tab.id === activeTabId}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
      )}

      <AddStreamDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
