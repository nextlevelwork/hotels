'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleClick = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={cn('flex gap-1 border-b border-border', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors relative cursor-pointer',
            active === tab.id
              ? 'text-primary'
              : 'text-muted hover:text-foreground'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs text-muted">({tab.count})</span>
          )}
          {active === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
