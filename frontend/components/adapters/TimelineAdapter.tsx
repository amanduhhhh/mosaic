'use client';

import { Timeline } from '@/components/core/Timeline';
import type { ComponentProps, TimelineEvent } from '../types';

export function TimelineAdapter({ data, config, onInteraction }: ComponentProps) {
  const events = (data as any[]) || [];
  const template = config.template || { title: 'title', description: 'description', timestamp: 'timestamp' };

  const timelineEvents = events.map(event => {
    const titleField = template.title || 'title';
    const descField = template.description;
    const timestampField = template.timestamp;

    return {
      title: String(event[titleField] ?? event.title ?? ''),
      description: descField ? String(event[descField] ?? event.description ?? '') : undefined,
      timestamp: timestampField ? String(event[timestampField] ?? event.timestamp ?? '') : undefined,
    };
  });

  return (
    <Timeline
      events={timelineEvents}
      onEventClick={(event, index) => {
        const originalEvent = events[index];
        if (originalEvent && onInteraction) {
          onInteraction({ clickedData: originalEvent });
        }
      }}
    />
  );
}

