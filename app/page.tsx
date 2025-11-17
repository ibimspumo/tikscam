'use client';

import { StreamManagerProvider } from '@/contexts/StreamManagerContext';
import { StreamTabs } from '@/components/StreamTabs';

export default function Home() {
  return (
    <StreamManagerProvider>
      <div className="min-h-screen bg-background">
        <StreamTabs />
      </div>
    </StreamManagerProvider>
  );
}
