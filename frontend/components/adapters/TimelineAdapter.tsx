'use client';

import { Timeline } from '@/components/core/Timeline';
import type { ComponentProps, TimelineEvent } from '../types';

export function TimelineAdapter({ data, config, onInteraction }: ComponentProps) {
  const events = (data as TimelineEvent[]) || [];

  const timelineEvents = events.map(event => ({
    title: event.title,
    description: event.description,
    timestamp: event.timestamp,
  }));

  return (
    <Timeline
      events={timelineEvents}
      onEventClick={(event, index) => {
        const originalEvent = events[index];
        if (originalEvent) {
          onInteraction('select', { event: originalEvent, index });
        }
      }}
    />
  );
}

