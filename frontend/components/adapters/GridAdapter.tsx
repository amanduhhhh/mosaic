'use client';

import { Card } from '@/components/core/Card';
import type { ComponentProps, GridItem } from '../types';

export function GridAdapter({ data, config, onInteraction }: ComponentProps) {
  const items = (data as GridItem[]) || [];
  const columns = config.columns || 3;

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {items.map((item, index) => (
        <Card
          key={item.id || index}
          variant="image"
          title={item.title ? String(item.title) : undefined}
          image={item.image ? String(item.image) : undefined}
          onClick={() => onInteraction('select', { item, index })}
        />
      ))}
    </div>
  );
}

