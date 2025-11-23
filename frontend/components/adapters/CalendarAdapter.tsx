'use client';

import { Calendar } from '@/components/core/Calendar';
import type { ComponentProps, CalendarDate } from '../types';

export function CalendarAdapter({ data, config, onInteraction }: ComponentProps) {
  const dates = (data as any[]) || [];
  const template = config.template || { date: 'date', description: 'description' };

  const calendarDates: CalendarDate[] = dates.map(item => {
    const dateField = template.date || 'date';
    const descField = template.description || 'description';

    return {
      date: String(item[dateField] ?? item.date ?? ''),
      description: String(item[descField] ?? item.description ?? ''),
    };
  });

  return (
    <Calendar
      dates={calendarDates}
      onDateClick={(date) => {
        if (onInteraction) {
          onInteraction({ clickedData: date });
        }
      }}
    />
  );
}

