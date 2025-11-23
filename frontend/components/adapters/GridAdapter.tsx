'use client';

import { Card } from '@/components/core/Card';
import type { ComponentProps, GridItem } from '../types';

export function GridAdapter({ data, config, onInteraction }: ComponentProps) {
  const items = (data as any[]) || [];
  const columns = config.columns || 3;
  const template = config.template || { title: 'title', subtitle: 'subtitle', image: 'image' };

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {items.map((item, index) => {
        const titleField = template.title || 'title';
        const subtitleField = template.subtitle;
        const imageField = template.image || 'image';

        return (
          <Card
            key={item.id || index}
            variant="image"
            title={String(item[titleField] ?? item.title ?? '')}
            subtitle={subtitleField ? String(item[subtitleField] ?? '') : undefined}
            image={String(item[imageField] ?? item.image ?? '')}
            onClick={() => onInteraction?.({ clickedData: item })}
          />
        );
      })}
    </div>
  );
}

