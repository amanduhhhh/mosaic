'use client';

import { List } from '@/components/core/List';
import type { ComponentProps } from '../types';

export function ListAdapter({ data, config, onInteraction }: ComponentProps) {
  let items = (data as any[]) || [];
  const template = config.template || { primary: 'title', secondary: 'subtitle' };
  const size = (config.size as 'sm' | 'md' | 'lg') || 'md';

  if (items.length > 0 && typeof items[0] === 'string') {
    items = items.map((item, index) => ({ id: index, value: item as string }));
    template.primary = 'value';
  }

  return (
    <List
      items={items}
      template={{
        primary: template.primary || 'title',
        secondary: template.secondary,
        meta: template.meta,
      }}
      ranked={config.layout === 'ranked'}
      size={size}
      onItemClick={(item) => onInteraction?.({ clickedData: item })}
    />
  );
}

